export const getContextForMetric = (metric, value) => {
  const numVal = parseFloat(value);
  
  const benchmarks = {
    wordCount: (v) => {
      if (v < 20000) return "Kort verhaal / Novelle (Animal Farm is ~30k)";
      if (v < 60000) return "Korte Roman (The Great Gatsby is ~47k)";
      if (v < 100000) return "Standaard Roman (Harry Potter 1 is ~77k)";
      if (v < 200000) return "Dik Boek (LOTR: Fellowship is ~187k)";
      return "Epos (Game of Thrones is ~298k)";
    },
    lixScore: (v) => {
      if (v < 30) return "Kinderboeken (Jip en Janneke)";
      if (v < 40) return "Young Adult (Harry Potter / Roald Dahl)";
      if (v < 50) return "Fictie / Krant (Stephen King)";
      if (v < 60) return "Moeilijk (Vakliteratuur / Essays)";
      return "Academisch (Wetboeken / Filosofie)";
    },
    ttr: (v) => {
      if (v < 35) return "Repetitief (Kinderrijmpjes / Pop songs)";
      if (v < 45) return "Gemiddeld (Moderne Thrillers)";
      if (v < 55) return "Rijk (Literaire Romans)";
      return "Zeer Rijk (Poëzie / Shakespeare)";
    },
    dialoguePercentage: (v) => {
      if (v < 20) return "Beschrijvend (Tolkien / Lovecraft)";
      if (v < 40) return "Gebalanceerd (Harry Potter / Hunger Games)";
      if (v < 60) return "Dialoog-gedreven (Hemingway / Elmore Leonard)";
      return "Toneelstuk-achtig / Script";
    },
    sentimentVolatility: (v) => {
      if (v < 2) return "Vlak / Informatief (Schoolboek)";
      if (v < 5) return "Stabiel (Feelgood roman)";
      return "Dramatisch / Grillig (Game of Thrones)";
    },
    avgSentenceLength: (v) => {
      if (v < 10) return "Kortaf (Hemingway / Actie)";
      if (v < 15) return "Vlot leesbaar (Harry Potter: ~12)";
      if (v < 20) return "Gemiddeld (NRC / Volkskrant)";
      return "Complex / Klassiek (Dickens / Proust)";
    }
  };

  return benchmarks[metric] ? benchmarks[metric](numVal) : "";
};
