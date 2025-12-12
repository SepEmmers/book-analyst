export const LANGUAGES = {
  nl: 'Nederlands',
  en: 'English',
  es: 'Español'
};

export const STOP_WORDS = {
  nl: new Set([
    'de', 'het', 'een', 'en', 'van', 'ik', 'te', 'dat', 'die', 'in', 'is', 'hij', 'was', 
    'met', 'op', 'voor', 'als', 'niet', 'maar', 'bij', 'ook', 'er', 'aan', 'om', 'ze', 
    'dan', 'of', 'dit', 'mijn', 'zij', 'je', 'haar', 'naar', 'heb', 'hem', 'uit', 'zijn', 
    'door', 'over', 'we', 'me', 'nu', 'wat', 'wel', 'nog', 'zo', 'tot', 'u', 'kunt', 
    'had', 'hoe', 'waar', 'hun', 'toch', 'al', 'kan', 'moet', 'na', 'geen', 'ja', 'nee',
    'deze', 'dit', 'waren', 'worden', 'wordt', 'zal', 'zullen'
  ]),
  en: new Set([
     'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 
     'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 
     'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 
     'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
     'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
     'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
     'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
     'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
     'these', 'give', 'day', 'most', 'us'
  ]),
  es: new Set([
     'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 
     'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 
     'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 
     'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 
     'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 
     'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 
     'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 
     'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 
     'ellas', 'nosotras', 'vosotros', 'vosotras'
  ])
};

export const HONORIFICS = {
  nl: new Set([
    'mrs', 'mr', 'dr', 'miss', 'ms', 'sir', 'madame', 'lady', 'lord', 'captain', 'colonel', 'major', 'general',
    'professor', 'mevrouw', 'meneer', 'heer', 'dokter', 'juffrouw', 'koning', 'koningin', 'prins', 'prinses'
  ]),
  en: new Set([
    'mrs', 'mr', 'dr', 'miss', 'ms', 'sir', 'madam', 'madame', 'lady', 'lord', 'captain', 'colonel', 'major', 'general',
    'professor', 'king', 'queen', 'prince', 'princess', 'president', 'prime', 'minister', 'officer', 'detective', 
    'sergeant', 'lieutenant', 'corporal', 'agent'
  ]),
  es: new Set([
    'señor', 'señora', 'sr', 'sra', 'srta', 'señorita', 'don', 'doña', 'doctor', 'doctora', 'dr', 'dra',
    'capitán', 'general', 'comandante', 'rey', 'reina', 'príncipe', 'princesa', 'padre', 'madre', 'hermano', 'hermana'
  ])
};

export const COMMON_PROPER_NOUNS = {
  nl: new Set([
    'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag',
    'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december',
    'god', 'jezus', 'bijbel', 'kerstmis', 'pasen', 'lente', 'zomer', 'herfst', 'winter'
  ]),
  en: new Set([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'god', 'jesus', 'bible', 'christmas', 'easter', 'spring', 'summer', 'autumn', 'winter', 'fall'
  ]),
  es: new Set([
    // Spanish technically doesn't capitalize days/months, but good to have just in case of inconsistent text
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    'dios', 'jesús', 'biblia', 'navidad', 'pascua'
  ])
};

export const NEGATION_WORDS = {
  nl: new Set(['niet', 'geen', 'nooit', 'nergens', 'niemand', 'nimmer']),
  en: new Set(['not', 'no', 'never', 'none', 'nobody', 'nowhere', "don't", "can't", "won't", "shouldn't", "couldn't", "wouldn't"]),
  es: new Set(['no', 'nunca', 'jamás', 'nadie', 'nada', 'tampoco'])
};

export const SENTIMENT_SCORES = {
  nl: {
    // Positief
    'goed': 1, 'mooi': 1, 'liefde': 2, 'gelukkig': 2, 'blij': 1, 'geweldig': 2, 'prachtig': 2,
    'vrolijk': 1, 'succes': 2, 'hoop': 1, 'veilig': 1, 'vrede': 1, 'genieten': 1, 'lachen': 1,
    'held': 2, 'licht': 1, 'warm': 1, 'gezellig': 1, 'sterk': 1, 'winst': 1, 'zege': 2,
    'heerlijk': 2, 'fijn': 1, 'fantastisch': 2, 'subliem': 2, 'zonnig': 1, 'vreugde': 2,
    'trots': 1, 'dankbaar': 1, 'vriend': 1, 'kus': 1, 'knuffel': 1, 'talent': 1,
    // Negatief
    'slecht': -1, 'kwaad': -2, 'haat': -2, 'verdriet': -2, 'pijn': -2, 'dood': -2, 'angst': -2,
    'bang': -1, 'verschrikkelijk': -2, 'donker': -1, 'koud': -1, 'alleen': -1, 'huilen': -1,
    'moeilijk': -1, 'oorlog': -2, 'verloren': -1, 'fout': -1, 'lelijk': -1, 'ziek': -1, 'moord': -3,
    'bloed': -1, 'schreeuw': -1, 'ramp': -2, 'verlies': -1, 'wanhoop': -2,
    'eenzaam': -2, 'duister': -1, 'gruwelijk': -2, 'mislukt': -2, 'breuk': -1, 'ruzie': -1,
    'ellende': -2, 'lijden': -2, 'bedrog': -2, 'jaloezie': -1, 'vijand': -2
  },
  en: {
    // Positive
    'good': 1, 'love': 2, 'happy': 2, 'great': 2, 'beautiful': 2, 'joy': 2, 'success': 2, 'hope': 1, 
    'safe': 1, 'peace': 1, 'laugh': 1, 'hero': 2, 'light': 1, 'warm': 1, 'strong': 1, 'win': 1,
    'wonderful': 2, 'amazing': 2, 'delight': 2, 'excellent': 2, 'kind': 1, 'friendly': 1, 'hug': 1,
    'kiss': 1, 'cheer': 1, 'victory': 2, 'freedom': 2, 'perfect': 2, 'lovely': 1, 'glad': 1,
    // Negative
    'bad': -1, 'evil': -2, 'hate': -2, 'sad': -1, 'pain': -2, 'death': -2, 'fear': -2, 'scared': -1,
    'terrible': -2, 'dark': -1, 'cold': -1, 'lonely': -1, 'cry': -1, 'difficult': -1, 'war': -2,
    'lost': -1, 'wrong': -1, 'ugly': -1, 'sick': -1, 'murder': -3, 'blood': -1, 'scream': -1, 'disaster': -2,
    'awful': -2, 'horror': -2, 'tragedy': -2, 'angry': -1, 'fury': -2, 'enemy': -2, 'kill': -2,
    'hurt': -1, 'broken': -1, 'fail': -2, 'failure': -2, 'grief': -2, 'sorrow': -1
  },
  es: {
    // Positivo
    'bien': 1, 'bueno': 1, 'amor': 2, 'feliz': 2, 'alegre': 1, 'genial': 2, 'hermoso': 2, 'bello': 2,
    'éxito': 2, 'esperanza': 1, 'seguro': 1, 'paz': 1, 'reír': 1, 'risa': 1, 'héroe': 2, 'luz': 1,
    'calor': 1, 'fuerte': 1, 'ganar': 1, 'victoria': 2, 'maravilloso': 2, 'fantástico': 2,
    'placer': 1, 'contento': 1, 'gracias': 1, 'amigo': 1, 'beso': 1, 'abrazo': 1, 'libre': 2,
    // Negativo
    'mal': -1, 'malo': -1, 'odio': -2, 'triste': -1, 'dolor': -2, 'muerte': -2, 'miedo': -2,
    'terrible': -2, 'oscuro': -1, 'frío': -1, 'solo': -1, 'soledad': -1, 'llorar': -1, 
    'difícil': -1, 'guerra': -2, 'perdido': -1, 'error': -1, 'feo': -1, 'enfermo': -1, 
    'asesinato': -3, 'sangre': -1, 'grito': -1, 'desastre': -2, 'tragedia': -2, 'enojo': -1,
    'furia': -2, 'enemigo': -2, 'matar': -2, 'herido': -1, 'roto': -1, 'fracaso': -2
  }
};

export const DESCRIPTIVE_SUFFIXES = {
  nl: ['ig', 'lijk', 'isch', 'baar', 'loos', 'zaam'],
  en: ['ous', 'ful', 'able', 'ive', 'ing', 'est', 'less', 'ish', 'al'],
  es: ['oso', 'osa', 'ble', 'ivo', 'iva', 'ante', 'ente', 'ado', 'ido']
};
