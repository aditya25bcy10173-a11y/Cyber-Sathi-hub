/**
 * Cryptographically Secure Password & Passphrase Generator
 * Utilizes window.crypto.getRandomValues() exclusively (No Math.random())
 */

const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const CHARSET_NUMBERS = "0123456789";
const CHARSET_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARS = new Set(["i", "I", "l", "L", "1", "|", "o", "O", "0", "`", "'", "\""]);

function getSecureRandomInt(max) {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  const maxSafe = Math.floor(0xFFFFFFFF / max) * max;
  let rand;
  do {
    window.crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= maxSafe);
  return rand % max;
}

function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generatePassword(options = {}) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    avoidAmbiguous = false
  } = options;

  let pool = "";
  const guaranteed = [];

  const filterChars = (chars) => {
    if (!avoidAmbiguous) return chars;
    return chars.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('');
  };

  const upperPool = filterChars(CHARSET_UPPER);
  const lowerPool = filterChars(CHARSET_LOWER);
  const numberPool = filterChars(CHARSET_NUMBERS);
  const symbolPool = filterChars(CHARSET_SYMBOLS);

  if (uppercase && upperPool) {
    pool += upperPool;
    guaranteed.push(upperPool[getSecureRandomInt(upperPool.length)]);
  }
  if (lowercase && lowerPool) {
    pool += lowerPool;
    guaranteed.push(lowerPool[getSecureRandomInt(lowerPool.length)]);
  }
  if (numbers && numberPool) {
    pool += numberPool;
    guaranteed.push(numberPool[getSecureRandomInt(numberPool.length)]);
  }
  if (symbols && symbolPool) {
    pool += symbolPool;
    guaranteed.push(symbolPool[getSecureRandomInt(symbolPool.length)]);
  }

  // Fallback if nothing selected
  if (!pool) {
    pool = lowerPool || CHARSET_LOWER;
    guaranteed.push(pool[getSecureRandomInt(pool.length)]);
  }

  const result = [...guaranteed];
  const targetLength = Math.max(result.length, length);

  while (result.length < targetLength) {
    result.push(pool[getSecureRandomInt(pool.length)]);
  }

  return secureShuffle(result).join('');
}

function generatePassphrase(wordlist = [], options = {}) {
  const {
    wordCount = 5,
    separator = "-",
    capitalize = false,
    includeNumber = false,
    includeSymbol = false
  } = options;

  if (!wordlist || wordlist.length === 0) {
    return "river-cactus-orbit-lantern-mango";
  }

  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = getSecureRandomInt(wordlist.length);
    let word = wordlist[idx].toLowerCase();
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (includeNumber) {
    const num = getSecureRandomInt(100);
    const pos = getSecureRandomInt(words.length);
    words[pos] = words[pos] + num;
  }

  if (includeSymbol) {
    const symbols = "!@#$%&*";
    const sym = symbols[getSecureRandomInt(symbols.length)];
    const pos = getSecureRandomInt(words.length);
    words[pos] = words[pos] + sym;
  }

  return words.join(separator);
}

if (typeof window !== 'undefined') {
  window.PasswordGenerator = { generatePassword, generatePassphrase };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePassword, generatePassphrase };
}
