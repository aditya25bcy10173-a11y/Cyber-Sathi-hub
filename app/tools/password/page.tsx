'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Eye, EyeOff, ArrowLeft, Terminal, Shield, ShieldAlert, ShieldCheck, 
  AlertTriangle, Copy, Check, RefreshCw, Dice5, Lock, Sparkles, BookOpen,
  Info, Cpu, Search, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';

// --- EMBEDDED WORDLISTS FOR CLIENT-SIDE DETERMINATION ---
const COMMON_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
  "1234567", "dragon", "welcome", "admin", "admin123", "root", "toor", "pass1234",
  "iloveyou", "princess", "rockyou", "monkey", "sunshine", "charlie", "donald",
  "football", "shadow", "master", "superman", "batman", "trustno1", "letmein",
  "starwars", "pokemon", "654321", "computer", "access", "secret", "system",
  "security", "qwertyuiop", "asdfghjkl", "zxcvbnm", "password1", "password123",
  "p@ssword", "p@ssw0rd", "pass123", "admin2024", "admin2025", "admin2026",
  "hunter2", "login123", "pass@123", "testing@123", "welcome@123", "india@123",
  "admin@123", "password@123", "google@123", "hello@123", "root@123"
]);

const COMMON_WORDS = [
  "about", "above", "account", "across", "action", "activity", "actor", "admit", "adult",
  "affect", "after", "again", "against", "agency", "agent", "agree", "ahead", "allow",
  "almost", "alone", "along", "already", "always", "animal", "another", "answer", "anyone",
  "appear", "apply", "area", "argue", "around", "arrive", "artist", "assume", "attack",
  "author", "avoid", "become", "before", "begin", "behind", "believe", "benefit", "better",
  "between", "beyond", "billion", "binary", "bishop", "blank", "bottle", "bottom", "branch",
  "brave", "breeze", "bridge", "bright", "broken", "brother", "budget", "build", "bullet",
  "butter", "button", "cabin", "cable", "cactus", "camera", "campus", "candle", "canyon",
  "canvas", "capital", "captain", "carbon", "career", "carpet", "castle", "casual", "cattle",
  "center", "circle", "citizen", "classic", "climate", "clover", "cluster", "coffee", "colony",
  "column", "combat", "comfort", "command", "common", "compass", "complex", "concert", "connect",
  "control", "copper", "corner", "correct", "corridor", "cosmic", "cotton", "council", "courage",
  "crater", "crayon", "cricket", "crisis", "cruise", "crystal", "culture", "curious", "current",
  "custom", "cylinder", "dagger", "damage", "danger", "daring", "darkness", "daylight", "decade",
  "defense", "degree", "delight", "deliver", "demand", "density", "deposit", "deputy", "desert",
  "design", "desire", "desktop", "destroy", "detail", "detect", "develop", "device", "diamond",
  "digital", "dinner", "direct", "discover", "display", "distant", "district", "diverse", "divide",
  "doctor", "document", "domain", "dolphin", "dragon", "drawer", "drift", "dynamic", "eagle",
  "early", "earth", "eastern", "echo", "eclipse", "economy", "editor", "effort", "elastic",
  "elder", "elect", "element", "elephant", "elite", "embark", "embrace", "emerald", "empire",
  "enable", "energy", "engage", "engine", "enhance", "enjoy", "enormous", "ensure", "entire",
  "episode", "epoch", "equal", "equip", "escape", "escort", "essay", "essence", "estate",
  "ethics", "evidence", "exact", "examine", "example", "excel", "exchange", "excite", "execute",
  "exhibit", "exotic", "expand", "expect", "expert", "expire", "explain", "explore", "export",
  "express", "extend", "extra", "fabric", "factor", "falcon", "family", "famous", "farmer",
  "father", "fathom", "feature", "federal", "fellow", "female", "festival", "fiber", "fiction",
  "field", "figure", "filter", "final", "finance", "finger", "finish", "firewall", "flame",
  "flash", "flavor", "flight", "flower", "focus", "folder", "follow", "forest", "forget",
  "format", "fortune", "forward", "fossil", "foster", "frame", "freedom", "freeze", "frequent",
  "friend", "frontier", "frozen", "fruit", "future", "galaxy", "gallery", "gaming", "garden",
  "garlic", "gather", "gateway", "general", "generate", "genius", "gentle", "genuine", "geology",
  "ghost", "giant", "glacier", "glass", "glimpse", "global", "glory", "golden", "govern",
  "grace", "gradual", "grain", "grand", "granite", "grape", "graphic", "gravity", "ground",
  "growth", "guard", "guest", "guidance", "guitar", "habitat", "hammer", "harbor", "harvest",
  "hazard", "header", "health", "heaven", "height", "helium", "helmet", "herald", "heritage",
  "heroic", "hidden", "highway", "history", "hollow", "honest", "horizon", "hostile", "hotel",
  "humble", "hunter", "hybrid", "iceberg", "iconic", "ideal", "identify", "ignite", "ignore",
  "image", "impact", "impulse", "include", "income", "increase", "index", "indicate", "indigo",
  "infinite", "inform", "inherit", "initial", "inject", "inquiry", "inside", "insight", "inspect",
  "inspire", "install", "instant", "intact", "integer", "intense", "intent", "interest", "internal",
  "invent", "invest", "invite", "invoke", "island", "isolate", "jacket", "jaguar", "jargon",
  "jasmine", "javelin", "jewel", "journal", "journey", "jovial", "judge", "juice", "jungle",
  "junior", "jupiter", "justice", "kernel", "kettle", "keyboard", "keynote", "kinetic", "kingdom",
  "kitchen", "knight", "ladder", "lagoon", "lantern", "laptop", "laser", "launch", "lawyer",
  "leader", "league", "legacy", "legend", "lemon", "length", "leopard", "lesson", "letter",
  "liberty", "library", "license", "light", "lightning", "limit", "linear", "liquid", "listen",
  "lizard", "locate", "logic", "lounge", "lumber", "lunar", "luxury", "magnet", "majestic",
  "mammal", "manager", "mango", "mansion", "manual", "marble", "margin", "marine", "market",
  "marvel", "mascot", "master", "matrix", "meadow", "measure", "mechanic", "medal", "medium",
  "melody", "member", "memory", "mentor", "mercury", "message", "meteor", "method", "midnight",
  "military", "mineral", "mirror", "mission", "mixture", "mobile", "model", "modern", "modify",
  "module", "moment", "monarch", "monitor", "monster", "monument", "morning", "motion", "mountain",
  "museum", "mushroom", "music", "mystery", "native", "nature", "navigate", "nebula", "needle",
  "network", "neutral", "nexus", "nickel", "night", "nimble", "nitrogen", "noble", "nomad",
  "normal", "northern", "notebook", "novel", "nuclear", "number", "numeric", "oakland", "oasis",
  "object", "observe", "obtain", "obvious", "ocean", "october", "office", "offline", "olympic",
  "online", "opaque", "operate", "optical", "optimal", "option", "orange", "orbit", "orchard",
  "order", "organic", "origin", "outline", "output", "outside", "package", "packet", "palace",
  "panther", "parade", "parallel", "parent", "passage", "passport", "patient", "patrol", "pattern",
  "payment", "peaceful", "pebble", "pelican", "penguin", "people", "perfect", "perform", "period",
  "person", "phantom", "phoenix", "phrase", "physical", "picture", "pioneer", "pipeline", "pirate",
  "planet", "plasma", "plastic", "platform", "platinum", "pleasant", "plugin", "pocket", "poetry",
  "polar", "police", "policy", "portal", "portion", "position", "positive", "possible", "posture",
  "powder", "prairie", "precious", "predict", "prepare", "present", "preserve", "primary", "primate",
  "prince", "princess", "priority", "prison", "privacy", "private", "problem", "process", "produce",
  "profile", "program", "project", "promise", "promote", "protect", "protein", "protocol", "proton",
  "provide", "prudent", "publish", "pulley", "pumpkin", "purple", "pursuit", "puzzle", "pyramid",
  "python", "quantum", "quarry", "quartz", "quench", "quest", "quick", "quiet", "quiver",
  "quote", "radar", "radiant", "radius", "railway", "rainbow", "random", "ranger", "rapid",
  "raptor", "record", "recover", "recruit", "redwood", "refine", "reflect", "reform", "refuge",
  "region", "regular", "reject", "relax", "release", "relief", "remain", "remedy", "remind",
  "remote", "render", "renew", "repair", "repeat", "replace", "replica", "report", "rescue",
  "research", "reserve", "resident", "resolve", "resource", "respect", "respond", "restore", "result",
  "retain", "reveal", "revenue", "reverse", "review", "reward", "rhythm", "ribbon", "riddle",
  "ridge", "ripple", "ritual", "rival", "river", "roadway", "robot", "robust", "rocket",
  "roller", "romantic", "rotate", "routine", "royal", "rubber", "ruby", "runner", "runway",
  "rustic", "sacred", "safari", "safety", "sailor", "salmon", "salute", "sample", "sandstone",
  "sapphire", "satellite", "satisfy", "scanner", "scenario", "scholar", "science", "scissors", "scramble",
  "scratch", "screen", "scroll", "sculpture", "season", "second", "secret", "sector", "secure",
  "segment", "select", "senator", "senior", "sensor", "sentence", "separate", "sequence", "service",
  "session", "settle", "shadow", "shelter", "sheriff", "shield", "shimmer", "shipment", "shoulder",
  "shuttle", "sibling", "sidebar", "signal", "silence", "silver", "simple", "simulate", "sincere",
  "single", "siren", "sister", "skeleton", "sketch", "skilled", "skyline", "slogan", "slumber",
  "smart", "smooth", "snowflake", "socket", "software", "soldier", "solemn", "solitary", "solution",
  "sonar", "sorcerer", "source", "southern", "sparkle", "spatial", "special", "species", "spectrum",
  "spider", "spiral", "splendid", "sponsor", "spring", "sprint", "sprout", "square", "stadium",
  "standard", "starfish", "starlight", "statement", "station", "statue", "stealth", "stellar", "stencil",
  "sterling", "sticker", "stimulate", "storage", "storm", "stranger", "strategy", "stream", "strength",
  "student", "studio", "stumble", "subject", "sublime", "submarine", "substance", "subway", "success",
  "sugar", "suggest", "suitcase", "summary", "summit", "sunflower", "sunlight", "sunrise", "sunset",
  "sunshine", "superb", "support", "surface", "surgeon", "surprise", "survey", "survival", "suspect",
  "sustain", "sweater", "swiftly", "symbol", "symmetry", "syntax", "tablet", "tackle", "tactical",
  "talent", "target", "tariff", "tavern", "teacher", "technology", "telescope", "temper", "temple",
  "tenant", "tender", "tension", "terminal", "terrace", "terrain", "textbook", "theater", "theory",
  "thermal", "thesis", "thunder", "timber", "timeline", "titanium", "toaster", "together", "token",
  "tomorrow", "tonight", "toolbox", "tornado", "tortoise", "total", "toucan", "tourism", "tracker",
  "traffic", "tragedy", "trainer", "transit", "translate", "travel", "treasure", "treatment", "triangle",
  "tribal", "tribute", "trickle", "trident", "trigger", "triumph", "trophy", "tropical", "trumpet",
  "tsunami", "tubular", "tulip", "tunnel", "turbine", "turkey", "turtle", "twilight", "typhoon",
  "typical", "umbrella", "unaware", "uncle", "uncover", "undergo", "uniform", "unique", "universe",
  "unknown", "unlock", "unveil", "upgrade", "upward", "uranium", "urgency", "urgent", "useful",
  "utility", "utopia", "vacation", "vacuum", "valley", "valuable", "vampire", "vanilla", "vanish",
  "variable", "variant", "variety", "vector", "vehicle", "velocity", "velvet", "venture", "verdict",
  "version", "vertical", "veteran", "vibrant", "victim", "victory", "viewer", "village", "vintage",
  "violet", "violin", "virtual", "visible", "vision", "visitor", "visual", "vital", "vivid",
  "vocal", "volcano", "voltage", "volume", "vortex", "voyage", "vulture", "waffle", "walnut",
  "warfare", "warmth", "warning", "warrior", "waterfall", "weapon", "weather", "webpage", "website",
  "weekend", "welcome", "western", "whisper", "whistle", "widget", "wildcat", "wildlife", "windpipe",
  "windows", "winner", "winter", "wisdom", "wizard", "wolfpack", "wooden", "workload", "workshop",
  "world", "worship", "wrestler", "writer", "yacht", "yardstick", "yearbook", "yellow", "yielding",
  "yogurt", "youth", "zealous", "zenith", "zephyr", "zigzag", "zipper", "zodiac", "zombie"
];

const LEET_MAP: Record<string, string> = {
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

const KEYBOARD_PATTERNS = [
  "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1234567890", "0987654321",
  "qazwsxedcrfvtgbyhnujmikolp"
];

// --- ANALYSIS FUNCTIONS ---
function normalizeLeet(text: string): string {
  let result = '';
  for (let ch of text.toLowerCase()) {
    result += LEET_MAP[ch] || ch;
  }
  return result;
}

function formatCrackTime(seconds: number): string {
  if (seconds <= 0.001) return "Instant (< 1 ms)";
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

function analyzePasswordLocally(password: string) {
  if (!password) {
    return {
      score: 0,
      strength: "Very Weak",
      entropy: 0,
      effectiveEntropy: 0,
      length: 0,
      charsets: { lowercase: false, uppercase: false, numbers: false, symbols: false, count: 0, poolSize: 0 },
      patterns: [] as { type: string; message: string }[],
      crackTimes: { onlineThrottled: "Instant", onlineUnthrottled: "Instant", offlineSlow: "Instant", offlineFast: "Instant" },
      why: "Please enter a password to evaluate its real-time cryptographic resilience.",
      recommendations: ["Enter a credential to inspect its vulnerability surface."]
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

  const rawEntropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize) * 10) / 10 : 0;
  let effectiveEntropy = rawEntropy;

  const patterns: { type: string; message: string }[] = [];
  const recommendations: string[] = [];
  const normalized = normalizeLeet(password);
  const lowerPass = password.toLowerCase();

  // 1. Common Password Database
  const isCommon = COMMON_PASSWORDS.has(lowerPass) || COMMON_PASSWORDS.has(normalized);
  if (isCommon) {
    patterns.push({ type: "common", message: "Matches a widely known compromised dictionary password" });
  }

  // 2. Dictionary Words
  const foundWords: string[] = [];
  for (const word of COMMON_WORDS) {
    if (word.length >= 4 && (lowerPass.includes(word) || normalized.includes(word))) {
      foundWords.push(word);
    }
  }

  if (foundWords.length > 0) {
    patterns.push({
      type: "dictionary",
      message: `Contains common dictionary words: ${foundWords.slice(0, 3).map(w => `"${w}"`).join(', ')}`
    });
  }

  // 3. Leetspeak substitutions
  if (normalized !== lowerPass && foundWords.length > 0) {
    patterns.push({
      type: "leetspeak",
      message: "Predictable character substitutions (e.g. '@' for 'a', '0' for 'o', '1' for 'i')"
    });
  }

  // 4. Sequential characters
  const sequences: string[] = [];
  for (let i = 0; i < lowerPass.length - 2; i++) {
    const c1 = lowerPass.charCodeAt(i);
    const c2 = lowerPass.charCodeAt(i + 1);
    const c3 = lowerPass.charCodeAt(i + 2);
    if ((c1 >= 48 && c1 <= 57) || (c1 >= 97 && c1 <= 122)) {
      if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
        sequences.push(lowerPass.substring(i, i + 3));
      }
    }
  }
  if (sequences.length > 0) {
    patterns.push({
      type: "sequence",
      message: `Sequential character runs: ${[...new Set(sequences)].slice(0, 3).map(s => `"${s}"`).join(', ')}`
    });
  }

  // 5. Keyboard walks
  const keyboardWalks: string[] = [];
  for (const row of KEYBOARD_PATTERNS) {
    const revRow = row.split('').reverse().join('');
    for (let len = 4; len >= 3; len--) {
      for (let i = 0; i <= row.length - len; i++) {
        const sub = row.substr(i, len);
        const revSub = revRow.substr(i, len);
        if (lowerPass.includes(sub)) keyboardWalks.push(sub);
        if (lowerPass.includes(revSub)) keyboardWalks.push(revSub);
      }
    }
  }
  if (keyboardWalks.length > 0) {
    patterns.push({
      type: "keyboard",
      message: `Physical keyboard walk detected: ${[...new Set(keyboardWalks)].slice(0, 3).map(k => `"${k}"`).join(', ')}`
    });
  }

  // 6. Repetitions
  if (/(.)\1{2,}/.test(password)) {
    patterns.push({ type: "repetition", message: "Consecutive repeated characters (e.g. 'aaa', '111')" });
  }

  // 7. Dates and years
  const yearMatch = password.match(/\b(19\d\d|20\d\d)\b/g) || password.match(/(19\d\d|20\d\d)/g);
  if (yearMatch) {
    patterns.push({ type: "date", message: `Contains year pattern: ${[...new Set(yearMatch)].slice(0, 2).join(', ')}` });
  }

  const isPassphrase = foundWords.length >= 3 && /[-_.\s]/.test(password) && length >= 15;

  // --- SCORING CALCULATION ---
  let score = 0;
  if (length < 6) score += 5;
  else if (length < 8) score += 15;
  else if (length < 10) score += 30;
  else if (length < 12) score += 45;
  else if (length < 16) score += 65;
  else if (length < 20) score += 80;
  else score += 90;

  const charsetsCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (charsetsCount === 1) score -= 15;
  else if (charsetsCount === 2) score += 5;
  else if (charsetsCount === 3) score += 12;
  else if (charsetsCount === 4) score += 20;

  if (isCommon) {
    score = Math.min(score, 10);
    effectiveEntropy = Math.min(effectiveEntropy, 12);
  }
  if (foundWords.length > 0 && !isPassphrase) {
    score -= 15;
    effectiveEntropy -= 14;
  }
  if (sequences.length > 0) {
    score -= sequences.length * 8;
    effectiveEntropy -= sequences.length * 6;
  }
  if (keyboardWalks.length > 0) {
    score -= keyboardWalks.length * 10;
    effectiveEntropy -= keyboardWalks.length * 8;
  }
  if (yearMatch) {
    score -= 12;
    effectiveEntropy -= 8;
  }
  if (isPassphrase) {
    score = Math.max(score, 85);
    effectiveEntropy = Math.max(effectiveEntropy, 64);
  }
  if (length < 8) {
    score = Math.min(score, 24);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  effectiveEntropy = Math.max(0, Math.round(effectiveEntropy * 10) / 10);

  let strength = "Very Weak";
  if (score >= 85) strength = "Very Strong";
  else if (score >= 70) strength = "Strong";
  else if (score >= 50) strength = "Fair";
  else if (score >= 25) strength = "Weak";

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
    why = `This password is weak due to short length or predictable pattern structure. Automated credential stuffing tools can compromise this quickly.`;
  } else {
    why = "This password is very weak. Its short length or extreme predictability makes it trivial for an automated attacker to crack immediately.";
  }

  if (isCommon) recommendations.push("Change this password immediately — it is present in known leak dictionaries.");
  if (length < 12) recommendations.push("Extend length to at least 16 characters (or combine 4+ random words into a passphrase).");
  if (!hasUpper) recommendations.push("Add uppercase letters (A-Z) to widen the search space.");
  if (!hasLower) recommendations.push("Include lowercase letters (a-z).");
  if (!hasNumber) recommendations.push("Incorporate numeric digits (0-9).");
  if (!hasSymbol) recommendations.push("Include special symbols (!@#$%^&*).");
  if (sequences.length > 0 || keyboardWalks.length > 0) recommendations.push("Remove sequential runs (e.g. '1234') and keyboard walks (e.g. 'qwerty').");
  if (recommendations.length === 0) recommendations.push("Password meets high cryptographic standards! Ensure it is unique and stored in a password manager.");

  const searchSpace = Math.pow(2, effectiveEntropy);
  const avgGuesses = searchSpace / 2;

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
      onlineThrottled: isCommon ? "Instant (< 1 sec)" : formatCrackTime(avgGuesses / (100 / 3600)),
      onlineUnthrottled: isCommon ? "Instant (< 1 sec)" : formatCrackTime(avgGuesses / 1000),
      offlineSlow: isCommon ? "Instant (< 1 sec)" : formatCrackTime(avgGuesses / 10000),
      offlineFast: isCommon ? "Instant (< 1 sec)" : formatCrackTime(avgGuesses / 1e11)
    },
    why,
    recommendations
  };
}

// --- SECURE GENERATOR (crypto.getRandomValues) ---
function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  const maxSafe = Math.floor(0xFFFFFFFF / max) * max;
  let rand: number;
  do {
    window.crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= maxSafe);
  return rand % max;
}

function generateSecurePassword(length = 16, upper = true, lower = true, numbers = true, symbols = true, avoidAmbiguous = false) {
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const NUM = "0123456789";
  const SYM = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const AMBIGUOUS = new Set(["i", "I", "l", "L", "1", "|", "o", "O", "0", "`", "'", "\""]);

  const filter = (str: string) => avoidAmbiguous ? str.split('').filter(c => !AMBIGUOUS.has(c)).join('') : str;

  let pool = "";
  const guaranteed: string[] = [];

  const u = filter(UPPER);
  const l = filter(LOWER);
  const n = filter(NUM);
  const s = filter(SYM);

  if (upper && u) { pool += u; guaranteed.push(u[getSecureRandomInt(u.length)]); }
  if (lower && l) { pool += l; guaranteed.push(l[getSecureRandomInt(l.length)]); }
  if (numbers && n) { pool += n; guaranteed.push(n[getSecureRandomInt(n.length)]); }
  if (symbols && s) { pool += s; guaranteed.push(s[getSecureRandomInt(s.length)]); }

  if (!pool) { pool = l || LOWER; guaranteed.push(pool[getSecureRandomInt(pool.length)]); }

  const result = [...guaranteed];
  while (result.length < length) {
    result.push(pool[getSecureRandomInt(pool.length)]);
  }

  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

function generateSecurePassphrase(wordCount = 5, separator = "-", capitalize = false, includeNumber = false, includeSymbol = false) {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = getSecureRandomInt(COMMON_WORDS.length);
    let word = COMMON_WORDS[idx].toLowerCase();
    if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
    words.push(word);
  }
  if (includeNumber) {
    const num = getSecureRandomInt(100);
    const pos = getSecureRandomInt(words.length);
    words[pos] = words[pos] + num;
  }
  if (includeSymbol) {
    const syms = "!@#$%&*";
    const sym = syms[getSecureRandomInt(syms.length)];
    const pos = getSecureRandomInt(words.length);
    words[pos] = words[pos] + sym;
  }
  return words.join(separator);
}

// --- PRIVACY-PRESERVING HIBP BREACH CHECKER (k-Anonymity) ---
async function checkBreachWithKAnonymity(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n');

  for (const line of lines) {
    const [lineSuffix, countStr] = line.trim().split(':');
    if (lineSuffix && lineSuffix.toUpperCase() === suffix) {
      return { breached: true, count: parseInt(countStr, 10) || 1, prefix };
    }
  }

  return { breached: false, count: 0, prefix };
}

// --- BACKGROUND ---
const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function PasswordAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'generator' | 'passphrase'>('analyzer');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Breach State
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState<{ breached?: boolean; count?: number; prefix?: string; error?: string } | null>(null);

  // Password Generator State
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [genNoAmbiguous, setGenNoAmbiguous] = useState(false);
  const [generatedPass, setGeneratedPass] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);

  // Passphrase Generator State
  const [phraseWords, setPhraseWords] = useState(5);
  const [phraseSep, setPhraseSep] = useState('-');
  const [phraseCap, setPhraseCap] = useState(false);
  const [phraseNum, setPhraseNum] = useState(false);
  const [phraseSym, setPhraseSym] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  // Evaluate password locally
  const report = useMemo(() => analyzePasswordLocally(passwordInput), [passwordInput]);

  useEffect(() => {
    // Generate initial items
    setGeneratedPass(generateSecurePassword(16, true, true, true, true, false));
    setGeneratedPhrase(generateSecurePassphrase(5, '-', false, false, false));
  }, []);

  const handleBreachCheck = async () => {
    if (!passwordInput) return;
    setIsCheckingBreach(true);
    setBreachResult(null);
    try {
      const res = await checkBreachWithKAnonymity(passwordInput);
      setBreachResult(res);
    } catch (err: any) {
      setBreachResult({ error: "Breach database unreachable. Check network connection." });
    }
    setIsCheckingBreach(false);
  };

  const handleCopy = (text: string, isPhrase = false) => {
    navigator.clipboard.writeText(text);
    if (isPhrase) {
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 3000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 3000);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'text-emerald-400 bg-emerald-500';
      case 'Strong': return 'text-blue-400 bg-blue-500';
      case 'Fair': return 'text-yellow-400 bg-yellow-500';
      case 'Weak': return 'text-orange-400 bg-orange-500';
      default: return 'text-red-500 bg-red-500';
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-500/30 overflow-y-auto relative p-4 md:p-10">
      <CyberBackground />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation & Privacy Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/?skipIntro=true" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors font-mono text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return to Command Center
          </Link>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% Client-Side Evaluation • Zero Server Data Transmission</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-red-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.25)] shrink-0">
            <Key className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Password Security Analyzer</h1>
            <p className="text-neutral-400 font-mono text-xs md:text-sm mt-1">Cryptographic Entropy, Multi-Pattern Detection & Privacy-Preserving Breach Verification</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'analyzer' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Search className="w-4 h-4" /> Password Analyzer
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'generator' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Random Password Generator
          </button>
          <button
            onClick={() => setActiveTab('passphrase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'passphrase' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Dice5 className="w-4 h-4" /> Passphrase Generator
          </button>
        </div>

        {/* TAB 1: PASSWORD ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Input & Realtime Gauge */}
              <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
                <div>
                  <label className="block text-xs font-mono text-red-500 mb-3 uppercase tracking-wider font-semibold">
                    Target Password Payload
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setBreachResult(null);
                      }}
                      className="w-full bg-black/90 border border-neutral-700 focus:border-red-500 rounded-xl px-5 py-4 text-lg text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono pr-12"
                      placeholder="Type or paste password to analyze..."
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Strength Meter Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400 uppercase">Strength Level:</span>
                    <span className={`font-bold uppercase ${getStrengthColor(report.strength).split(' ')[0]}`}>
                      {passwordInput ? report.strength : 'Awaiting Input'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <motion.div 
                      className={`h-full rounded-full ${getStrengthColor(report.strength).split(' ')[1]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, report.score)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Verbal "WHY" Explanation Box */}
                <div className="bg-neutral-900/60 border-l-4 border-red-500 p-4 rounded-r-xl text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
                  {report.why}
                </div>

                {/* Privacy-Preserving HIBP Breach Checker */}
                <div className="bg-neutral-900/40 border border-dashed border-red-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-sm text-white font-mono uppercase">Breach Check (k-Anonymity)</h3>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Check if this password has appeared in public breaches without revealing your credential. Only the first 5 characters of a local SHA-1 hash are queried against Have I Been Pwned.
                  </p>
                  
                  <button
                    onClick={handleBreachCheck}
                    disabled={isCheckingBreach || !passwordInput}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-red-600/30"
                  >
                    {isCheckingBreach ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Querying Anonymous Hash Prefix...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Check Known Data Breaches</>
                    )}
                  </button>

                  {breachResult && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      {breachResult.error ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                          {breachResult.error}
                        </div>
                      ) : breachResult.breached ? (
                        <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-red-400 font-bold">
                            <AlertTriangle className="w-4 h-4 text-red-500" /> COMPROMISED IN KNOWN BREACHES!
                          </div>
                          <p className="text-neutral-300">
                            This password has appeared in <strong>{breachResult.count?.toLocaleString()}</strong> public data breaches. 
                          </p>
                          <p className="text-red-400 font-semibold">
                            ⚠️ A password can be mathematically strong but still unsafe if already exposed. Do not use this password!
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> NO BREACHES FOUND
                          </div>
                          <p className="text-neutral-300">
                            This password was not found in known public leak databases (verified via k-Anonymity prefix <code className="text-emerald-400">{breachResult.prefix}</code>).
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Right Column: Score, Properties & Crack Times */}
              <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
                
                {/* Score Gauge Badge */}
                <div className="flex items-center justify-between p-4 bg-black/60 border border-neutral-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Overall Security Score</p>
                    <p className="text-[11px] text-neutral-500">Multi-factor algorithmic weighting</p>
                  </div>
                  <div className="font-mono text-3xl font-black">
                    <span className={getStrengthColor(report.strength).split(' ')[0]}>{report.score}</span>
                    <span className="text-xs text-neutral-600 font-normal"> / 100</span>
                  </div>
                </div>

                {/* Character-Set Breakdown Table */}
                <div className="space-y-2">
                  <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Password Properties</p>
                  <div className="bg-black/50 border border-neutral-800 rounded-2xl p-4 text-xs font-mono divide-y divide-neutral-900 space-y-1">
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Total Length</span>
                      <span className="text-white font-bold">{report.length} characters</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Estimated Entropy</span>
                      <span className="text-white font-bold">{report.effectiveEntropy} bits</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Uppercase Letters (A-Z)</span>
                      <span>{report.charsets.uppercase ? <span className="text-emerald-400 font-bold">✓ Included</span> : <span className="text-neutral-600">✗ None</span>}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Lowercase Letters (a-z)</span>
                      <span>{report.charsets.lowercase ? <span className="text-emerald-400 font-bold">✓ Included</span> : <span className="text-neutral-600">✗ None</span>}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Numeric Digits (0-9)</span>
                      <span>{report.charsets.numbers ? <span className="text-emerald-400 font-bold">✓ Included</span> : <span className="text-neutral-600">✗ None</span>}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Special Symbols (!@#$)</span>
                      <span>{report.charsets.symbols ? <span className="text-emerald-400 font-bold">✓ Included</span> : <span className="text-neutral-600">✗ None</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Crack Time Scenarios */}
                <div className="space-y-2">
                  <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">⏳ Estimated Crack Time Scenarios</p>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 uppercase">Online Throttled (100/hr)</p>
                      <p className="font-bold text-white text-xs mt-1">{report.crackTimes.onlineThrottled}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 uppercase">Fast Online API (1k/sec)</p>
                      <p className="font-bold text-white text-xs mt-1">{report.crackTimes.onlineUnthrottled}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 uppercase">Offline Argon2 (10k/sec)</p>
                      <p className="font-bold text-white text-xs mt-1">{report.crackTimes.offlineSlow}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 uppercase">GPU Hash Rig (100B/sec)</p>
                      <p className="font-bold text-white text-xs mt-1">{report.crackTimes.offlineFast}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-600 font-mono">*Estimates based on theoretical automated brute-force cluster speeds.</p>
                </div>

              </div>

            </div>

            {/* Pattern Warnings & Actionable Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Identified Pattern Weaknesses
                </h3>
                <ul className="space-y-2 text-xs font-mono">
                  {report.patterns.length > 0 ? (
                    report.patterns.map((p, i) => (
                      <li key={i} className="p-3 bg-orange-950/20 border border-orange-500/20 rounded-xl text-orange-300 flex items-start gap-2">
                        <span className="text-orange-500 font-bold">►</span> {p.message}
                      </li>
                    ))
                  ) : (
                    <li className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      No obvious dictionary, keyboard walk, or sequential runs detected.
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4" /> Actionable Recommendations
                </h3>
                <ul className="space-y-2 text-xs font-mono">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-cyan-300 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">💡</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RANDOM PASSWORD GENERATOR */}
        {activeTab === 'generator' && (
          <div className="max-w-2xl mx-auto bg-neutral-950/90 border border-neutral-800 p-8 rounded-3xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" /> Cryptographic Password Generator
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">Generated locally using browser Web Crypto API (<code className="text-emerald-400">crypto.getRandomValues()</code>)</p>
            </div>

            {/* Generated Output */}
            <div className="relative p-4 bg-black border border-neutral-800 rounded-2xl font-mono text-lg text-emerald-400 break-all pr-24 flex items-center min-h-[60px]">
              {generatedPass}
              <button
                onClick={() => handleCopy(generatedPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedPass ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Length:</span>
                  <span className="font-bold text-white">{genLength} characters</span>
                </div>
                <input 
                  type="range" 
                  min={8} 
                  max={64} 
                  value={genLength} 
                  onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                  className="w-full accent-red-500 cursor-pointer" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={genUpper} onChange={(e) => setGenUpper(e.target.checked)} className="accent-red-500" />
                  Uppercase (A-Z)
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={genLower} onChange={(e) => setGenLower(e.target.checked)} className="accent-red-500" />
                  Lowercase (a-z)
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={genNumbers} onChange={(e) => setGenNumbers(e.target.checked)} className="accent-red-500" />
                  Numbers (0-9)
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={genSymbols} onChange={(e) => setGenSymbols(e.target.checked)} className="accent-red-500" />
                  Symbols (!@#$)
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer col-span-2">
                  <input type="checkbox" checked={genNoAmbiguous} onChange={(e) => setGenNoAmbiguous(e.target.checked)} className="accent-red-500" />
                  Exclude ambiguous characters (i, l, 1, L, o, 0, O, |)
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGeneratedPass(generateSecurePassword(genLength, genUpper, genLower, genNumbers, genSymbols, genNoAmbiguous))}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-red-600/30"
              >
                <RefreshCw className="w-4 h-4" /> Generate New
              </button>
              <button
                onClick={() => {
                  setPasswordInput(generatedPass);
                  setActiveTab('analyzer');
                }}
                className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Test in Analyzer
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PASSPHRASE GENERATOR */}
        {activeTab === 'passphrase' && (
          <div className="max-w-2xl mx-auto bg-neutral-950/90 border border-neutral-800 p-8 rounded-3xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Dice5 className="w-5 h-5 text-red-500" /> Memorable Diceware Passphrase Generator
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">Multi-word passphrases that are mathematically hard to brute-force but easy to remember.</p>
            </div>

            {/* Generated Output */}
            <div className="relative p-4 bg-black border border-neutral-800 rounded-2xl font-mono text-lg text-emerald-400 break-all pr-24 flex items-center min-h-[60px]">
              {generatedPhrase}
              <button
                onClick={() => handleCopy(generatedPhrase, true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedPhrase ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Number of Words:</span>
                  <span className="font-bold text-white">{phraseWords} words</span>
                </div>
                <input 
                  type="range" 
                  min={3} 
                  max={8} 
                  value={phraseWords} 
                  onChange={(e) => setPhraseWords(parseInt(e.target.value, 10))}
                  className="w-full accent-red-500 cursor-pointer" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400 uppercase">Word Separator:</label>
                <select 
                  value={phraseSep} 
                  onChange={(e) => setPhraseSep(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-white"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=".">Period (.)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=" ">Space ( )</option>
                  <option value="">No Separator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={phraseCap} onChange={(e) => setPhraseCap(e.target.checked)} className="accent-red-500" />
                  Capitalize Each Word
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={phraseNum} onChange={(e) => setPhraseNum(e.target.checked)} className="accent-red-500" />
                  Include Random Number
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={phraseSym} onChange={(e) => setPhraseSym(e.target.checked)} className="accent-red-500" />
                  Include Random Symbol
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGeneratedPhrase(generateSecurePassphrase(phraseWords, phraseSep, phraseCap, phraseNum, phraseSym))}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-red-600/30"
              >
                <RefreshCw className="w-4 h-4" /> Generate New
              </button>
              <button
                onClick={() => {
                  setPasswordInput(generatedPhrase);
                  setActiveTab('analyzer');
                }}
                className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Test in Analyzer
              </button>
            </div>
          </div>
        )}

        {/* Education & Best Practice Cards */}
        <div className="pt-6 border-t border-neutral-800 space-y-4">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-500" /> Essential Credential Hardening Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2 font-mono">
                <Lock className="w-4 h-4 text-red-500" /> Password Managers
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Use an encrypted vault (Bitwarden, 1Password, KeePassXC) to generate and store unique credentials for every account.
              </p>
            </div>

            <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-orange-500" /> Zero Credential Reuse
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Automated bots replay breached passwords across thousands of services. Never reuse passwords across sites.
              </p>
            </div>

            <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enable MFA / 2FA
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Hardware security keys or authenticator apps block 99% of credential stuffing and account takeover attacks.
              </p>
            </div>

            <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4 text-cyan-500" /> Length &gt; Complexity
              </div>
              <p className="text-neutral-400 leading-relaxed">
                A 20-character multi-word passphrase is mathematically more secure and easier to remember than short complex strings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}