
export const getBadges = (analysis) => {
  const { metrics, meta } = analysis;
  const badges = [];

  // Volatility Badges
  if (metrics.sentimentVolatility > 8) {
    badges.push({ 
      id: 'drama-queen', icon: '🎭', label: 'Drama Queen', 
      desc: 'Extreem hoge emotionele pieken en dalen.' 
    });
  } else if (metrics.sentimentVolatility < 3) {
    badges.push({ 
      id: 'zen-master', icon: '🧘', label: 'Zen Meester', 
      desc: 'Zeer stabiele sfeer en emoties.' 
    });
  }

  // Dialogue Badges
  if (metrics.dialoguePercentage > 40) {
    badges.push({ 
      id: 'chatterbox', icon: '🗣️', label: 'Spraakwaterval', 
      desc: 'Meer dan 40% dialoog.' 
    });
  } else if (metrics.dialoguePercentage < 5) {
    badges.push({ 
      id: 'observer', icon: '👁️', label: 'De Observator', 
      desc: 'Bijna geen gesproken woord.' 
    });
  }

  // Complexity Badges
  if (metrics.lixScore > 55) {
    badges.push({ 
      id: 'brain-teaser', icon: '🧠', label: 'Breinbreker', 
      desc: 'Hoge complexiteit en lange zinnen.' 
    });
  } else if (metrics.lixScore < 30) {
    badges.push({ 
      id: 'easy-breezy', icon: '🍃', label: 'Lekker Licht', 
      desc: 'Zeer makkelijk leesbaar.' 
    });
  }

  // Length Badges
  if (meta.wordCount > 150000) {
    badges.push({ 
      id: 'doorstopper', icon: '🧱', label: 'Deurstopper', 
      desc: 'Een enorm boek (>150k woorden).' 
    });
  } else if (meta.wordCount < 10000) {
    badges.push({ 
      id: 'quick-snack', icon: '🍪', label: 'Tussendoortje', 
      desc: 'Kort verhaal (<10k woorden).' 
    });
  }

  return badges;
};

export const predictGenre = (analysis) => {
    // Simple Keyword Heuristic (very basic)
    // In a real app, this would use the frequency map against genre dictionaries
    
    // We can infer from metrics slightly
    const { metrics, visuals } = analysis;
    const topWords = visuals.topWords.map(t => t.text.toLowerCase());
    
    const keywords = {
        fantasy: ['magic', 'dragon', 'king', 'queen', 'sword', 'wizard', 'elf', 'tover', 'draak', 'koning', 'zwaard'],
        scifi: ['space', 'ship', 'planet', 'alien', 'laser', 'robot', 'ai', 'ruimte', 'schip', 'planeet'],
        romance: ['love', 'kiss', 'heart', 'marriage', 'husband', 'wife', 'liefde', 'kus', 'hart', 'huwelijk'],
        thriller: ['gun', 'kill', 'murder', 'blood', 'police', 'detective', 'moord', 'bloed', 'politie', 'wapen']
    };

    let scores = { fantasy: 0, scifi: 0, romance: 0, thriller: 0 };
    
    // Check top words (naive)
    topWords.forEach(w => {
        if (keywords.fantasy.includes(w)) scores.fantasy++;
        if (keywords.scifi.includes(w)) scores.scifi++;
        if (keywords.romance.includes(w)) scores.romance++;
        if (keywords.thriller.includes(w)) scores.thriller++;
    });

    // Metric adjustments
    if (metrics.sentimentVolatility > 8) scores.thriller += 1; 
    if (metrics.sentimentVolatility > 6) scores.romance += 1;

    // Find Winner
    const winner = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    if (scores[winner] === 0) return 'Literatuur / Algemeen';
    
    const map = {
        fantasy: 'Fantasy 🐉',
        scifi: 'Science Fiction 🚀',
        romance: 'Romantiek 💖',
        thriller: 'Thriller / Misdaad 🔪'
    };
    
    return map[winner];
};

export const predictAudience = (lixScore) => {
    if (lixScore < 25) return 'Kinderen (6-10)';
    if (lixScore < 35) return 'Young Adult (12-18)';
    if (lixScore < 50) return 'Volwassenen (Algemeen)';
    if (lixScore < 60) return 'Volwassenen (Complex)';
    return 'Academisch / Expert';
};
