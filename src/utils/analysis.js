import { STOP_WORDS, SENTIMENT_SCORES, DESCRIPTIVE_SUFFIXES, HONORIFICS, COMMON_PROPER_NOUNS, NEGATION_WORDS } from '../constants/dictionaries';

export const detectLanguage = (words) => {
  const scores = {};
  
  // Check overlap with stop words for a sample of the text
  const sample = new Set(words.slice(0, 1000).map(w => w.toLowerCase()));
  
  for (const [lang, stopSet] of Object.entries(STOP_WORDS)) {
    let overlap = 0;
    for (const word of sample) {
      if (stopSet.has(word)) overlap++;
    }
    scores[lang] = overlap;
  }
  
  // Find lang with max overlap
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
};

export const analyzeBookAdvanced = (text, title, manualLang = null) => {
  const cleanText = text.replace(/\r\n/g, '\n');

  
  // Advanced Word Tokenization 
  const wordsRaw = cleanText.replace(/[^a-zA-Zà-üÀ-Ü0-9\s'-]/g, ' ').split(/\s+/);
  const words = wordsRaw.filter(w => w.length > 0);
  
  // Detect Language if not forced
  const lang = manualLang || detectLanguage(words);
  
  // Select Language Dictionaries
  const stopWords = STOP_WORDS[lang] || STOP_WORDS['en'];
  const sentScores = SENTIMENT_SCORES[lang] || SENTIMENT_SCORES['en'];
  const suffixes = DESCRIPTIVE_SUFFIXES[lang] || DESCRIPTIVE_SUFFIXES['en'];
  const honorifics = HONORIFICS[lang] || HONORIFICS['en'];
  const commonProperNouns = COMMON_PROPER_NOUNS[lang] || COMMON_PROPER_NOUNS['en'];
  const negationWords = NEGATION_WORDS[lang] || NEGATION_WORDS['en'];

  let totalChars = 0;
  let longestWord = "";
  let complexWordsCount = 0; // > 6 letters
  
  const frequencyMap = {};
  const sentimentTimeline = [];
  const sentenceLengths = [];
  let dialogueWordCount = 0;
  let questionCount = 0;
  let exclamationCount = 0;
  let descriptiveWordCount = 0;
  
  let currentChunkScore = 0;
  const chunkSize = Math.max(100, Math.ceil(words.length / 40)); 
  let chunkIndex = 0;

  const potentialCharacters = {};
  
  // --- SENTENCE ANALYSIS ---
  // Using match to keep delimiters or counting explicitly
  const sentenceMatches = cleanText.match(/[^.!?\r\n]+[.!?]+(\s|$)/g) || [];
  const sentences = sentenceMatches.length > 0 ? sentenceMatches : cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Recalculate basic counts from raw text to be sure
  questionCount = (cleanText.match(/\?/g) || []).length;
  exclamationCount = (cleanText.match(/!/g) || []).length;

  sentences.forEach(sentence => {
    const sWords = sentence.trim().split(/\s+/);
    sentenceLengths.push(sWords.length);
    // Question/Exclamation counting moved to raw text for accuracy
    
    // Naive dialogue detection (quotes)
    const dialogueMatch = sentence.match(/["'«»‘“](.*?)["'»’”]/g);
    if (dialogueMatch) {
      dialogueMatch.forEach(d => {
        dialogueWordCount += d.split(/\s+/).length;
      });
    }
  });

  // --- WORD ANALYSIS ---
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase().replace(/[^a-zñà-ü]/g, '');
    const prevWordLower = i > 0 ? words[i-1].toLowerCase().replace(/[^a-zñà-ü]/g, '') : '';
    
    totalChars += word.length;
    
    // Stats
    if (word.length > 6) complexWordsCount++;
    if (word.length > longestWord.length) longestWord = word;

    if (!stopWords.has(lowerWord) && isNaN(word)) {
      frequencyMap[lowerWord] = (frequencyMap[lowerWord] || 0) + 1;
    }

    if (suffixes.some(suffix => lowerWord.endsWith(suffix))) descriptiveWordCount++;

    // Sentiment with Negation
    if (sentScores[lowerWord]) {
      let score = sentScores[lowerWord];
      if (negationWords.has(prevWordLower)) {
        score *= -1; // Flip sentiment
      }
      currentChunkScore += score;
    }

    // Timeline Snapshot
    if ((i + 1) % chunkSize === 0 || i === words.length - 1) {
      sentimentTimeline.push({
        segment: chunkIndex + 1,
        sentiment: currentChunkScore,
        index: i
      });
      currentChunkScore = 0;
      chunkIndex++;
    }
  }

  // --- ADVANCED CHARACTER DETECTION ---
  
  const isCapitalized = (w) => w && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase();
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Zñà-ü]/g, ''); 
    const lowerWord = word.toLowerCase();
    
    // Skip if empty or stopword
    if (!word || stopWords.has(lowerWord)) continue;

    if (isCapitalized(word)) {
        // Potential Name Start
        // Check if it's an excluded word (Honorific, Day, Common)
        if (honorifics.has(lowerWord) || commonProperNouns.has(lowerWord)) continue;
        
        let fullName = word;
        let nextIdx = i + 1;
        
        // Look ahead for multi-part names (e.g. Sherlock Holmes)
        while (
            nextIdx < words.length && 
            isCapitalized(words[nextIdx].replace(/[^a-zA-Zñà-ü]/g, '')) &&
            !stopWords.has(words[nextIdx].toLowerCase())
        ) {
            fullName += " " + words[nextIdx].replace(/[^a-zA-Zñà-ü]/g, '');
            nextIdx++;
        }
        
        if (nextIdx > i + 1) {
            i = nextIdx - 1; 
        }

        // Basic Filtering
        if (fullName.length > 2 && !stopWords.has(fullName.toLowerCase())) {
             potentialCharacters[fullName] = (potentialCharacters[fullName] || 0) + 1;
        }
    }
  }

  // Post-process Characters (Filter low frequency noise)
  const significantCharacterThreshold = Math.max(3, words.length / 5000); 
  const topCharacters = Object.entries(potentialCharacters)
    .filter(([name, count]) => count > significantCharacterThreshold) 
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // --- METRICS CALCULATION ---

  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  const longWordPercentage = (complexWordsCount / words.length) * 100;
  const lixScore = avgSentenceLength + longWordPercentage;
  
  const uniqueWords = Object.keys(frequencyMap).length;
  const ttr = (uniqueWords / words.length) * 100;

  const timelineScores = sentimentTimeline.map(s => s.sentiment);
  const avgSent = timelineScores.reduce((a,b) => a+b, 0) / (timelineScores.length || 1);
  const variance = timelineScores.reduce((a,b) => a + Math.pow(b - avgSent, 2), 0) / (timelineScores.length || 1);
  const sentimentVolatility = Math.sqrt(variance);

  const lengthBins = { 'Kort (<5)': 0, 'Normaal (5-15)': 0, 'Lang (15-25)': 0, 'Complex (25+)': 0 };
  sentenceLengths.forEach(len => {
    if (len < 5) lengthBins['Kort (<5)']++;
    else if (len <= 15) lengthBins['Normaal (5-15)']++;
    else if (len <= 25) lengthBins['Lang (15-25)']++;
    else lengthBins['Complex (25+)']++;
  });
  const sentenceStructureData = Object.entries(lengthBins).map(([name, value]) => ({ name, value }));

  const radarData = [
    { subject: 'Actie', A: Math.min(100, (exclamationCount / sentences.length) * 500 + 20), fullMark: 100 },
    { subject: 'Beschrijvend', A: Math.min(100, (descriptiveWordCount / words.length) * 500), fullMark: 100 },
    { subject: 'Dialoog', A: Math.min(100, (dialogueWordCount / words.length) * 200), fullMark: 100 },
    { subject: 'Complexiteit', A: Math.min(100, lixScore * 1.5), fullMark: 100 },
    { subject: 'Drama', A: Math.min(100, sentimentVolatility * 20), fullMark: 100 },
    { subject: 'Vocabulaire', A: Math.min(100, ttr * 5), fullMark: 100 },
  ];

  return {
    lang, // RETURN THE DETECTED LANGUAGE
    meta: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordLength: (totalChars / words.length).toFixed(1),
      avgSentenceLength: avgSentenceLength.toFixed(1),
      longestWord,
      readTime: Math.ceil(words.length / 200) + " min",
    },
    metrics: {
      lixScore: lixScore.toFixed(1),
      ttr: ttr.toFixed(1),
      dialoguePercentage: ((dialogueWordCount / words.length) * 100).toFixed(1),
      descriptivePercentage: ((descriptiveWordCount / words.length) * 100).toFixed(1),
      sentimentVolatility: sentimentVolatility.toFixed(1),
      questionRatio: ((questionCount / sentences.length) * 100).toFixed(1),
    },
    visuals: {
      sentimentTimeline,
      sentenceStructureData,
      radarData,
      topCharacters,
      topWords: Object.entries(frequencyMap).sort(([,a], [,b]) => b - a).slice(0, 20).map(([text, value]) => ({ text, value })),
    }
  };
};
