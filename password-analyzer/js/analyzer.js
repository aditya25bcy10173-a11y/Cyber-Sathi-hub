/**
 * Password Analysis & Security Assessment Engine
 * 100% Client-Side / Zero Data Transmission
 */

const KEYBOARD_PATTERNS = [
  "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1234567890", "0987654321",
  "qazwsxedcrfvtgbyhnujmikolp",
  "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p"
];

const LEET_MAP = {
  '@': 'a', '4': 'a',
  '8': 'b',
  '3': 'e',
  '9': 'g',
  '1': 'i', '!': 'i', '|': 'i',
  '0': 'o',
  '5': 's', '$': 's',
  '7': 't', '+': 't',
  '2': 'z'
};

function normalizeLeet(text) {
  let result = '';
  for (let ch of text.toLowerCase()) {
    result += LEET_MAP[ch] || ch;
  }
  return result;
}

function calculateEntropy(length, poolSize) {
  if (!length || poolSize <= 0) return 0;
  return Math.round(length * Math.log2(poolSize) * 100) / 100;
}

function formatCrackTime(seconds) {
  if (seconds <= 0.001) return "Instant (< 1 millisecond)";
  if (seconds < 1) return "Instant (< 1 second)";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 10000) return `${(seconds / 31536000).toLocaleString('en-US', { maximumFractionDigits: 0 })} years`;
  if (seconds < 31536000 * 1e9) return `${(seconds / (31536000 * 1e6)).toFixed(1)} million years`;
  if (seconds < 31536000 * 1e12) return `${(seconds / (31536000 * 1e9)).toFixed(1)} billion years`;
  return "Centuries (Resilient to Brute-Force)";
}

function detectSequences(str) {
  const lower = str.toLowerCase();
  const matches = [];

  // Sequential Numbers
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i);
    const c2 = lower.charCodeAt(i + 1);
    const c3 = lower.charCodeAt(i + 2);
    if (c1 >= 48 && c1 <= 57 && c2 >= 48 && c2 <= 57 && c3 >= 48 && c3 <= 57) {
      if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
        matches.push(lower.substring(i, i + 3));
      }
    }
  }

  // Sequential Letters
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i);
    const c2 = lower.charCodeAt(i + 1);
    const c3 = lower.charCodeAt(i + 2);
    if (c1 >= 97 && c1 <= 122 && c2 >= 97 && c2 <= 122 && c3 >= 97 && c3 <= 122) {
      if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
        matches.push(lower.substring(i, i + 3));
      }
    }
  }

  return [...new Set(matches)];
}

function detectKeyboardWalks(str) {
  const lower = str.toLowerCase();
  const walks = [];

  for (const row of KEYBOARD_PATTERNS) {
    const revRow = row.split('').reverse().join('');
    for (let len = 4; len >= 3; len--) {
      for (let i = 0; i <= row.length - len; i++) {
        const sub = row.substr(i, len);
        const revSub = revRow.substr(i, len);
        if (lower.includes(sub)) walks.push(sub);
        if (lower.includes(revSub)) walks.push(revSub);
      }
    }
  }

  return [...new Set(walks)];
}

function detectRepetition(str) {
  const flags = [];
  
  // Consecutive identical characters (e.g. "aaa", "111")
  if (/(.)\1{2,}/.test(str)) {
    const match = str.match(/(.)\1{2,}/g);
    flags.push(`Repeated character sequence: "${match.join(', ')}"`);
  }

  // Repeating blocks (e.g. "abcabc", "1212")
  if (/^(.{2,5})\1+$/.test(str)) {
    flags.push("Repeated pattern block throughout the entire password");
  } else {
    for (let len = 2; len <= 4; len++) {
      const regex = new RegExp(`(.{${len}})\\1{2,}`, 'i');
      if (regex.test(str)) {
        flags.push(`Repeated chunk structure detected`);
        break;
      }
    }
  }

  return flags;
}

function detectDatesAndYears(str) {
  const dates = [];
  // 4-digit years between 1900 and 2099
  const yearMatch = str.match(/\b(19\d\d|20\d\d)\b/g) || str.match(/(19\d\d|20\d\d)/g);
  if (yearMatch) {
    dates.push(...yearMatch);
  }
  // Date formats (e.g., 01011999, 12-05-2024, 20260101)
  if (/\b\d{2}[-./]?\d{2}[-./]?(?:19|20)\d{2}\b/.test(str)) {
    dates.push("Date pattern (DD/MM/YYYY or MM/DD/YYYY)");
  }
  return [...new Set(dates)];
}

function analyzePassword(password, wordlist = null) {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      strength: "Very Weak",
      entropy: 0,
      effectiveEntropy: 0,
      length: 0,
      charsets: { lowercase: false, uppercase: false, numbers: false, symbols: false },
      patterns: [],
      crackTimes: {
        onlineThrottled: "Instant",
        onlineUnthrottled: "Instant",
        offlineSlow: "Instant",
        offlineFast: "Instant"
      },
      why: "Please enter a password to begin real-time cryptographic analysis.",
      recommendations: ["Enter a password to evaluate its resilience."]
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  const rawEntropy = calculateEntropy(length, poolSize);
  let effectiveEntropy = rawEntropy;

  const patterns = [];
  const recommendations = [];
  const normalized = normalizeLeet(password);
  const lowerPass = password.toLowerCase();

  // 1. Common Passwords Check
  let isCommon = false;
  if (wordlist && wordlist.commonPasswords) {
    if (wordlist.commonPasswords.includes(lowerPass) || wordlist.commonPasswords.includes(normalized)) {
      isCommon = true;
      patterns.push({ type: "common", message: "Matches a widely known compromised dictionary password" });
    }
  }

  // 2. Dictionary Words Detection (including leetspeak)
  const foundWords = [];
  if (wordlist && wordlist.commonWords) {
    for (const word of wordlist.commonWords) {
      if (word.length >= 4) {
        if (lowerPass.includes(word) || normalized.includes(word)) {
          foundWords.push(word);
        }
      }
    }
  }

  if (foundWords.length > 0) {
    const topWords = foundWords.slice(0, 3);
    patterns.push({
      type: "dictionary",
      message: `Contains common dictionary word(s): ${topWords.map(w => `"${w}"`).join(', ')}`
    });
  }

  // 3. Leetspeak Detection
  if (normalized !== lowerPass && foundWords.length > 0) {
    patterns.push({
      type: "leetspeak",
      message: "Predictable character substitutions (e.g. '@' for 'a', '0' for 'o', '1' for 'i')"
    });
  }

  // 4. Sequential Characters
  const sequences = detectSequences(password);
  if (sequences.length > 0) {
    patterns.push({
      type: "sequence",
      message: `Contains sequential character order: ${sequences.slice(0, 3).map(s => `"${s}"`).join(', ')}`
    });
  }

  // 5. Keyboard Walks
  const keyboardWalks = detectKeyboardWalks(password);
  if (keyboardWalks.length > 0) {
    patterns.push({
      type: "keyboard",
      message: `Contains physical keyboard walk pattern: ${keyboardWalks.slice(0, 3).map(k => `"${k}"`).join(', ')}`
    });
  }

  // 6. Repetitions
  const repetitions = detectRepetition(password);
  for (const rep of repetitions) {
    patterns.push({ type: "repetition", message: rep });
  }

  // 7. Dates and Years
  const dates = detectDatesAndYears(password);
  if (dates.length > 0) {
    patterns.push({
      type: "date",
      message: `Contains year or date pattern: ${dates.slice(0, 2).join(', ')}`
    });
  }

  // Check if passphrase style (e.g. "river-cactus-orbit-lantern-mango" or multiple words separated by space/hyphen)
  const isPassphrase = foundWords.length >= 3 && /[-_.\s]/.test(password) && length >= 15;

  // --- SCORING ALGORITHM (0 - 100) ---
  let score = 0;

  // Length Scoring
  if (length < 6) score += 5;
  else if (length < 8) score += 15;
  else if (length < 10) score += 30;
  else if (length < 12) score += 45;
  else if (length < 16) score += 65;
  else if (length < 20) score += 80;
  else score += 90;

  // Charset Diversity Bonus
  const charsetsCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (charsetsCount === 1) score -= 15;
  else if (charsetsCount === 2) score += 5;
  else if (charsetsCount === 3) score += 12;
  else if (charsetsCount === 4) score += 20;

  // Pattern Penalties
  if (isCommon) {
    score = Math.min(score, 10);
    effectiveEntropy = Math.min(effectiveEntropy, 12);
  }

  if (foundWords.length > 0 && !isPassphrase) {
    score -= 15;
    effectiveEntropy -= 14;
  }

  if (sequences.length > 0) {
    score -= (sequences.length * 8);
    effectiveEntropy -= (sequences.length * 6);
  }

  if (keyboardWalks.length > 0) {
    score -= (keyboardWalks.length * 10);
    effectiveEntropy -= (keyboardWalks.length * 8);
  }

  if (repetitions.length > 0) {
    score -= (repetitions.length * 8);
    effectiveEntropy -= (repetitions.length * 6);
  }

  if (dates.length > 0) {
    score -= 12;
    effectiveEntropy -= 8;
  }

  // Passphrase Bonus
  if (isPassphrase) {
    score = Math.max(score, 85);
    effectiveEntropy = Math.max(effectiveEntropy, 64);
  }

  // Length Cap Rules
  if (length < 8) {
    score = Math.min(score, 24);
  } else if (length < 12 && score > 65) {
    score = 65;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  effectiveEntropy = Math.max(0, Math.round(effectiveEntropy * 10) / 10);

  // Strength Level
  let strength = "Very Weak";
  if (score >= 85) strength = "Very Strong";
  else if (score >= 70) strength = "Strong";
  else if (score >= 50) strength = "Fair";
  else if (score >= 25) strength = "Weak";
  else strength = "Very Weak";

  // --- HUMAN-READABLE "WHY" EXPLANATION ---
  let why = "";
  if (isCommon) {
    why = "This password is critically unsafe because it appears in public lists of top breached passwords and can be cracked in less than a second.";
  } else if (score >= 85) {
    why = isPassphrase 
      ? "This password is very strong because it utilizes a multi-word passphrase structure with generous length, making it exceptionally resistant to both dictionary and brute-force attacks."
      : "This password is very strong because it exceeds 16 characters, utilizes multiple character sets, and has high cryptographic entropy with no predictable keyboard or dictionary patterns.";
  } else if (score >= 70) {
    why = "This password is strong with adequate length and character diversity. It avoids obvious predictable sequences and provides good brute-force defense.";
  } else if (score >= 50) {
    const issues = [];
    if (length < 12) issues.push("it is under 12 characters");
    if (foundWords.length > 0) issues.push("it incorporates common words");
    if (sequences.length > 0) issues.push("it contains predictable sequences");
    if (charsetsCount < 3) issues.push("character variety is limited");
    why = `This password is fair, but vulnerabilities exist because ${issues.join(' and ')}.`;
  } else if (score >= 25) {
    const reasons = [];
    if (length < 10) reasons.push("short character length");
    if (sequences.length > 0 || keyboardWalks.length > 0) reasons.push("predictable keyboard patterns or number sequences");
    if (foundWords.length > 0) reasons.push("common dictionary words");
    why = `This password is weak due to ${reasons.join(', ')}. Automated credential attacks can compromise this quickly.`;
  } else {
    why = "This password is very weak. Its short length or extreme predictability makes it trivial for an automated attacker to crack immediately.";
  }

  // --- ACTIONABLE RECOMMENDATIONS ---
  if (isCommon) {
    recommendations.push("Change this password immediately — it is present in known leak dictionaries.");
  }
  if (length < 12) {
    recommendations.push("Extend length to at least 16 characters (or combine 4+ random words into a passphrase).");
  }
  if (!hasUpper) {
    recommendations.push("Add uppercase letters (A-Z) to widen the search space.");
  }
  if (!hasLower) {
    recommendations.push("Include lowercase letters (a-z).");
  }
  if (!hasNumber) {
    recommendations.push("Incorporate numeric digits (0-9).");
  }
  if (!hasSymbol) {
    recommendations.push("Include special symbols (!@#$%^&*).");
  }
  if (sequences.length > 0 || keyboardWalks.length > 0) {
    recommendations.push("Remove sequential runs (e.g. '1234', 'abcd') and keyboard walks (e.g. 'qwerty').");
  }
  if (dates.length > 0) {
    recommendations.push("Avoid using birth years, current years, or calendar dates.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Password meets high cryptographic standards! Ensure it is unique and store it in a password manager.");
  }

  // --- CRACK TIME CALCULATIONS ---
  // Search space S = 2^effectiveEntropy
  const searchSpace = Math.pow(2, effectiveEntropy);
  const avgGuesses = searchSpace / 2;

  // 1. Online Throttled (100 attempts / hour = 100 / 3600 per sec = 0.02777)
  const timeOnlineThrottled = avgGuesses / (100 / 3600);

  // 2. Online Unthrottled API (1,000 attempts / sec)
  const timeOnlineUnthrottled = avgGuesses / 1000;

  // 3. Offline Slow Hash (Argon2 / bcrypt: 10,000 / sec)
  const timeOfflineSlow = avgGuesses / 10000;

  // 4. Offline Fast Hash (MD5 / SHA-256 GPU cluster: 100 Billion / sec = 1e11)
  const timeOfflineFast = avgGuesses / 1e11;

  return {
    score,
    strength,
    entropy: rawEntropy,
    effectiveEntropy,
    length,
    charsets: {
      lowercase: hasLower,
      uppercase: hasUpper,
      numbers: hasNumber,
      symbols: hasSymbol,
      count: charsetsCount,
      poolSize
    },
    patterns,
    crackTimes: {
      onlineThrottled: isCommon ? "Instant (< 1 second)" : formatCrackTime(timeOnlineThrottled),
      onlineUnthrottled: isCommon ? "Instant (< 1 second)" : formatCrackTime(timeOnlineUnthrottled),
      offlineSlow: isCommon ? "Instant (< 1 second)" : formatCrackTime(timeOfflineSlow),
      offlineFast: isCommon ? "Instant (< 1 second)" : formatCrackTime(timeOfflineFast)
    },
    why,
    recommendations
  };
}

// Support both Browser global and Node / ES module environments
if (typeof window !== 'undefined') {
  window.PasswordAnalyzerEngine = { analyzePassword, calculateEntropy, normalizeLeet };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzePassword, calculateEntropy, normalizeLeet };
}
