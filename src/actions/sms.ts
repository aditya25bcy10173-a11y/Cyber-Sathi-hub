"use server"

const SMISHING_PATTERNS: Array<{ pattern: RegExp; desc: string; score: number }> = [
  { pattern: /\b(otp|one time password|verification code|pin|cvv|secret code)\b/i, desc: "Requests sensitive authentication token/OTP", score: 35 },
  { pattern: /\b(blocked|suspended|deactivated|kyc expired|pan linked|electricity disconnected|bank account locked|challan)\b/i, desc: "Urgent financial or utility blockage threat", score: 30 },
  { pattern: /\b(won|lottery|prize|cashback|credited|reward points|claim now|congrats|free gift|instant cash)\b/i, desc: "Lure with fake rewards or cashback", score: 30 },
  { pattern: /\b(apk|download app|click link|bit\.ly|tinyurl|wa\.me|t\.me|tiny\.one|is\.gd|cutt\.ly)\b/i, desc: "Suspicious link or malicious APK payload", score: 30 }
];

export interface SmsAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeSms(messageText: string): Promise<SmsAnalysisResponse> {
  try {
    const rawMessage = (messageText || '').trim();
    if (!rawMessage) {
      return { status: "error", error: "No SMS text provided" };
    }

    const cleanedTokens = rawMessage.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const flags: string[] = [];
    let riskScore = 0;

    for (const item of SMISHING_PATTERNS) {
      if (item.pattern.test(rawMessage)) {
        flags.push(item.desc);
        riskScore += item.score;
      }
    }

    if (/https?:\/\/\S+|\b(?:bit\.ly|t\.me|wa\.me|tinyurl\.com|tiny\.one|is\.gd)\/\S+/i.test(rawMessage)) {
      if (!flags.some(f => f.includes("link"))) {
        flags.push("Contains short/obfuscated link commonly used in smishing");
        riskScore += 25;
      }
    }

    let severity = "LOW";
    let verdict = "CLEAN / LEGITIMATE";
    if (riskScore >= 50) {
      verdict = "FRAUDULENT / SMISHING DETECTED";
      severity = "HIGH";
    } else if (riskScore >= 25) {
      verdict = "SUSPICIOUS SMS";
      severity = "MEDIUM";
    }

    const report = {
      status: "success",
      original_message: rawMessage,
      cleaned_tokens: cleanedTokens,
      severity: severity,
      risk_score: Math.min(100, riskScore),
      verdict: verdict,
      indicators: flags.length > 0 ? flags : ["No smishing indicators detected."],
      ml_analysis: `Heuristic NLP Engine: ${Math.min(100, riskScore)}% confidence`
    };

    return {
      status: "success",
      report: report,
      data: report
    };
  } catch (error: any) {
    console.error("SMS Analysis Error:", error);
    return { status: "error", error: error?.message || "SMS Analysis Failed." };
  }
}
