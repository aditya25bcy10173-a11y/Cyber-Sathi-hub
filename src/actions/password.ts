"use server"

const COMMON_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
  "1234567", "dragon", "welcome", "admin", "admin123", "root", "toor", "pass1234",
  "iloveyou", "princess", "rockyou", "monkey", "sunshine", "charlie", "donald",
  "football", "shadow", "master", "superman", "batman", "trustno1", "letmein",
  "starwars", "pokemon", "654321", "computer", "access", "secret", "system",
  "security", "qwertyuiop", "asdfghjkl", "zxcvbnm", "password1", "password123",
  "p@ssword", "p@ssw0rd", "pass123", "admin2024", "admin2025", "admin2026",
  "hunter2", "login123", "pass@123", "testing@123", "welcome@123", "india@123"
]);

function calculateEntropy(pwd: string): number {
  if (!pwd) return 0;
  let charsetSize = 0;
  if (/[a-z]/.test(pwd)) charsetSize += 26;
  if (/[A-Z]/.test(pwd)) charsetSize += 26;
  if (/\d/.test(pwd)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 33;
  if (charsetSize === 0) charsetSize = 256;
  return Number((pwd.length * Math.log2(charsetSize)).toFixed(2));
}

export interface PasswordAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzePassword(passwordStr: string): Promise<PasswordAnalysisResponse> {
  try {
    const password = passwordStr || '';
    if (!password) {
      return { status: "error", error: "No password provided" };
    }

    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());
    const entropy = calculateEntropy(password);

    let score = 0;
    if (length >= 8) score += 20;
    if (length >= 12) score += 20;
    if (length >= 16) score += 10;
    if (hasLower && hasUpper) score += 20;
    if (hasDigit) score += 15;
    if (hasSpecial) score += 15;

    if (isCommon) {
      score = Math.min(score, 15);
    }

    let strength = "CRITICAL / VERY WEAK";
    let crackTime = "Instantaneous";

    if (score >= 80) {
      strength = "VERY STRONG";
      crackTime = "Centuries";
    } else if (score >= 60) {
      strength = "STRONG";
      crackTime = "Years";
    } else if (score >= 40) {
      strength = "MODERATE";
      crackTime = "Days to Months";
    } else if (score >= 20) {
      strength = "WEAK";
      crackTime = "Minutes to Hours";
    }

    const report = {
      length: length,
      entropy_bits: entropy,
      strength_score: score,
      strength_label: strength,
      estimated_crack_time: crackTime,
      is_common_password: isCommon,
      checks: {
        has_lowercase: hasLower,
        has_uppercase: hasUpper,
        has_digits: hasDigit,
        has_special_chars: hasSpecial,
        min_length_met: length >= 8
      }
    };

    return {
      status: "success",
      report: report,
      data: report
    };
  } catch (error: any) {
    console.error("Password Analysis Error:", error);
    return { status: "error", error: error?.message || "Password Analysis Failed." };
  }
}