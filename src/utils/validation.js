
// Basic list of offensive/reserved words (English & Dutch)
export const BAD_WORDS = [
    'admin', 'root', 'superuser', 'moderator', 'support', 'help', 'system',
    'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut', 'nigger', 'faggot', 'kanker', 'tering', 'tyfus', 'hoer', 'slet', 'kut', 'lul', 'pik', 'flikker', 'homo', 'neger', 'mongool', 'debiel'
];

export const validateUsername = (username) => {
    if (!username) return { valid: false, error: "Gebruikersnaam mag niet leeg zijn." };
    
    if (username.length < 3) return { valid: false, error: "Gebruikersnaam moet minimaal 3 tekens zijn." };
    if (username.length > 20) return { valid: false, error: "Gebruikersnaam mag maximaal 20 tekens zijn." };

    // Regex: Alpha-numeric and underscores only
    const validChars = /^[a-zA-Z0-9_]+$/;
    if (!validChars.test(username)) {
        return { valid: false, error: "Alleen letters, cijfers en underscores toegestaan (geen spaties, geen emojis)." };
    }

    // Check for bad words (substring check might be too aggressive for short names, doing exact word match or strict inclusion)
    const lowerUser = username.toLowerCase();
    
    // Exact match check
    if (BAD_WORDS.includes(lowerUser)) {
        return { valid: false, error: "Deze gebruikersnaam is niet toegestaan." };
    }
    
    // Substring Check for very offensive words (optional, but requested "strenge controle")
    // We check if the username CONTAINS any bad word, but only if the username is long enough to avoid false positives (e.g. 'analyst' contains 'anal')
    // For simplicity in this demo, we sticking to a slightly smarter check or just exact/partial
    const offensiveMatch = BAD_WORDS.find(word => lowerUser.includes(word));
    if (offensiveMatch) {
         // Exception for words that might be part of normal words? 
         // For now, let's keep it strict as requested.
         return { valid: false, error: "Gebruikersnaam bevat niet toegestane woorden." };
    }

    return { valid: true, error: null };
};

export const validateBookTitle = (title) => {
    if (!title) return { valid: false, error: "Titel mag niet leeg zijn." };
    if (title.trim().length === 0) return { valid: false, error: "Titel mag niet leeg zijn." };
    if (title.length > 100) return { valid: false, error: "Titel mag maximaal 100 tekens zijn." };

    const lowerTitle = title.toLowerCase();
    const offensiveMatch = BAD_WORDS.find(word => lowerTitle.includes(word));
    if (offensiveMatch) {
         return { valid: false, error: "Titel bevat niet toegestane woorden." };
    }

    return { valid: true, error: null };
};
