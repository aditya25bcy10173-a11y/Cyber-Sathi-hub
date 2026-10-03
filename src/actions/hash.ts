"use server"

interface HashMatch {
  algorithm: string;
  description: string;
  length: number;
}

const HASH_DB: Array<{ name: string; pattern: RegExp; desc: string }> = [
  { name: "CRC-16", pattern: /^[a-fA-F0-9]{4}$/, desc: "Cyclic Redundancy Check 16-bit" },
  { name: "CRC-32", pattern: /^[a-fA-F0-9]{8}$/, desc: "Cyclic Redundancy Check 32-bit" },
  { name: "Adler-32", pattern: /^[a-fA-F0-9]{8}$/, desc: "Adler-32 Checksum" },
  { name: "MySQL 3.x", pattern: /^[a-fA-F0-9]{16}$/, desc: "MySQL v3.x Password Hash" },
  { name: "MD2", pattern: /^[a-fA-F0-9]{32}$/, desc: "Message Digest 2" },
  { name: "MD4", pattern: /^[a-fA-F0-9]{32}$/, desc: "Message Digest 4" },
  { name: "MD5", pattern: /^[a-fA-F0-9]{32}$/, desc: "Message Digest 5 (most common)" },
  { name: "NTLM", pattern: /^[a-fA-F0-9]{32}$/, desc: "NT LAN Manager Hash" },
  { name: "LM Hash", pattern: /^[a-fA-F0-9]{32}$/, desc: "LAN Manager Hash (legacy Windows)" },
  { name: "HMAC-MD5", pattern: /^[a-fA-F0-9]{32}$/, desc: "HMAC using MD5" },
  { name: "SHA-1", pattern: /^[a-fA-F0-9]{40}$/, desc: "Secure Hash Algorithm 1" },
  { name: "RIPEMD-160", pattern: /^[a-fA-F0-9]{40}$/, desc: "RACE Integrity Primitives 160-bit" },
  { name: "MySQL 4.x/5.x", pattern: /^\*[a-fA-F0-9]{40}$/, desc: "MySQL v4.x/5.x Password Hash" },
  { name: "HMAC-SHA1", pattern: /^[a-fA-F0-9]{40}$/, desc: "HMAC using SHA-1" },
  { name: "SHA-224", pattern: /^[a-fA-F0-9]{56}$/, desc: "Secure Hash Algorithm 224-bit" },
  { name: "SHA3-224", pattern: /^[a-fA-F0-9]{56}$/, desc: "SHA-3 224-bit (Keccak)" },
  { name: "SHA-256", pattern: /^[a-fA-F0-9]{64}$/, desc: "Secure Hash Algorithm 256-bit" },
  { name: "SHA3-256", pattern: /^[a-fA-F0-9]{64}$/, desc: "SHA-3 256-bit (Keccak)" },
  { name: "HMAC-SHA256", pattern: /^[a-fA-F0-9]{64}$/, desc: "HMAC using SHA-256" },
  { name: "SHA-384", pattern: /^[a-fA-F0-9]{96}$/, desc: "Secure Hash Algorithm 384-bit" },
  { name: "SHA3-384", pattern: /^[a-fA-F0-9]{96}$/, desc: "SHA-3 384-bit (Keccak)" },
  { name: "SHA-512", pattern: /^[a-fA-F0-9]{128}$/, desc: "Secure Hash Algorithm 512-bit" },
  { name: "SHA3-512", pattern: /^[a-fA-F0-9]{128}$/, desc: "SHA-3 512-bit (Keccak)" },
  { name: "Whirlpool", pattern: /^[a-fA-F0-9]{128}$/, desc: "Whirlpool Hash 512-bit" },
  { name: "bcrypt", pattern: /^\$2[aby]?\$\d{2}\$.{53}$/, desc: "bcrypt Blowfish Hash" },
  { name: "MD5 (Unix)", pattern: /^\$1\$.{8}\$.{22}$/, desc: "Unix MD5 Crypt" },
  { name: "SHA-256 (Unix)", pattern: /^\$5\$.{8,16}\$.{43}$/, desc: "Unix SHA-256 Crypt" },
  { name: "SHA-512 (Unix)", pattern: /^\$6\$.{8,16}\$.{86}$/, desc: "Unix SHA-512 Crypt" },
  { name: "Base64 Encoded", pattern: /^[A-Za-z0-9+/]+=*$/, desc: "Possibly Base64-encoded data" }
];

export interface HashAnalysisResponse {
  status: "success" | "error";
  forensic_report?: any;
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeHash(hashString: string): Promise<HashAnalysisResponse> {
  try {
    const cleanHash = (hashString || '').trim();
    if (!cleanHash) {
      return { status: "error", error: "No hash provided in payload" };
    }

    const matches: HashMatch[] = [];
    for (const item of HASH_DB) {
      if (item.pattern.test(cleanHash)) {
        matches.push({
          algorithm: item.name,
          description: item.desc,
          length: cleanHash.length
        });
      }
    }

    const priorityOrder = [
      "MD5", "SHA-1", "SHA-256", "SHA-512", "SHA-224", "SHA-384",
      "bcrypt", "NTLM", "MySQL 4.x/5.x", "SHA3-256", "SHA3-512"
    ];

    matches.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.algorithm);
      const bIdx = priorityOrder.indexOf(b.algorithm);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.algorithm.localeCompare(b.algorithm);
    });

    const algoNames = matches.map(m => m.algorithm);

    let vulnerability = "Unknown";
    if (algoNames.some(a => ["MD2", "MD4", "MD5", "LM Hash"].includes(a))) {
      vulnerability = "CRITICAL (Cryptographically Broken / Obsolete)";
    } else if (algoNames.some(a => ["SHA-1", "RIPEMD-160"].includes(a))) {
      vulnerability = "HIGH (Collision Deprecated)";
    } else if (algoNames.some(a => ["SHA-256", "SHA-512", "SHA3-256", "SHA3-512", "Whirlpool"].includes(a))) {
      vulnerability = "LOW (Current Industry Standard)";
    } else if (algoNames.includes("bcrypt")) {
      vulnerability = "VERY LOW (Strong Key Derivation)";
    }

    const report = {
      hash: cleanHash,
      length: cleanHash.length,
      status: matches.length > 0 ? "Identified" : "Unknown Format",
      algorithms: algoNames.length > 0 ? algoNames : ["Unrecognized"],
      matches: matches,
      vulnerability: vulnerability,
      match_count: matches.length
    };

    return {
      status: "success",
      forensic_report: report,
      report: report,
      data: report
    };
  } catch (error: any) {
    console.error("Hash Analysis Error:", error);
    return { status: "error", error: error?.message || "Hash Analysis Failed." };
  }
}