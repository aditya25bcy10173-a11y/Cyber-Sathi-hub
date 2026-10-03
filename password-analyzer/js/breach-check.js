/**
 * Privacy-Preserving Password Breach Verification Engine
 * Uses k-Anonymity: Password is NEVER sent over the network.
 * Only the first 5 characters of the SHA-1 hash are queried against HIBP Pwned Passwords API.
 */

async function sha1Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const buffer = await window.crypto.subtle.digest('SHA-1', data);
  const array = Array.from(new Uint8Array(buffer));
  return array.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function checkPasswordBreach(password) {
  if (!password) {
    return { error: "No password provided" };
  }

  try {
    // 1. Calculate SHA-1 hash locally in client browser
    const fullHash = await sha1Hex(password);
    const prefix = fullHash.slice(0, 5);
    const suffix = fullHash.slice(5);

    // 2. Fetch range of anonymous hash suffixes from public HIBP API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true' // Prevents response size analysis
      }
    });

    if (!response.ok) {
      throw new Error(`HIBP API responded with HTTP status ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n');

    // 3. Compare the remaining 35 characters locally
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        const count = parseInt(countStr, 10) || 1;
        return {
          breached: true,
          count: count,
          hashPrefix: prefix,
          fullHashMasked: `${prefix}***********************************`,
          checkedAt: new Date().toISOString()
        };
      }
    }

    // Not found in any known database
    return {
      breached: false,
      count: 0,
      hashPrefix: prefix,
      fullHashMasked: `${prefix}***********************************`,
      checkedAt: new Date().toISOString()
    };

  } catch (err) {
    console.warn("Breach verification service unavailable:", err);
    return {
      error: "Unable to contact breach verification database. (Offline or CORS restricted).",
      details: err.message
    };
  }
}

if (typeof window !== 'undefined') {
  window.PasswordBreachChecker = { checkPasswordBreach, sha1Hex };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkPasswordBreach, sha1Hex };
}
