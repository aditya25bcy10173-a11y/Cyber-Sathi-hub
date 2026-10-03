"use server"

const PHISHING_KEYWORDS: Array<{ pattern: RegExp; desc: string; score: number }> = [
  { pattern: /\b(urgent|immediate action|account suspended|verify now|unauthorized access|security breach|action required|final notice)\b/i, desc: "Artificial urgency or panic inducement detected", score: 25 },
  { pattern: /\b(bank|wire transfer|gift card|crypto|bitcoin|inheritance|lottery|winner|prize|claim reward|cash prize)\b/i, desc: "Financial / monetary solicitation flags", score: 25 },
  { pattern: /\b(update your password|click here|confirm identity|reset credentials|verify login|validate account)\b/i, desc: "Direct credential harvesting call-to-action", score: 30 },
  { pattern: /\b(irs|police|tax|legal action|arrest warrant|court|fbi|customs|income tax department)\b/i, desc: "Government or authority impersonation language", score: 25 },
  { pattern: /\b(dear customer|dear user|valued member|dear citizen|undisclosed recipients)\b/i, desc: "Generic salutation common in mass phishing campaigns", score: 15 }
];

const URL_REGEX = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi;

export interface EmailAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeEmail(emailText: string): Promise<EmailAnalysisResponse> {
  try {
    const rawText = (emailText || '').trim();
    if (!rawText) {
      return { status: "error", error: "No email text provided in payload" };
    }

    const redFlags: string[] = [];
    let riskScore = 0;

    for (const item of PHISHING_KEYWORDS) {
      const match = rawText.match(item.pattern);
      if (match) {
        redFlags.push(`${item.desc} (matched: ${match[0]})`);
        riskScore += item.score;
      }
    }

    const foundUrls = rawText.match(URL_REGEX) || [];
    const urlReports: string[] = [];

    for (const u of foundUrls) {
      try {
        const fullUrl = u.startsWith('http') ? u : 'http://' + u;
        const parsed = new URL(fullUrl);
        const domain = parsed.hostname;

        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
          urlReports.push(`[CRITICAL] Embedded link points to raw IP (${domain})`);
          riskScore += 30;
        } else if (['.xyz', '.top', '.tk', '.click', '.buzz'].some(tld => domain.endsWith(tld))) {
          urlReports.push(`[SUSPICIOUS] Embedded link uses high-abuse TLD (${domain})`);
          riskScore += 20;
        } else {
          urlReports.push(`[INSPECTED] Link extracted: ${u}`);
        }
      } catch {
        urlReports.push(`[INSPECTED] Link extracted: ${u}`);
      }
    }

    let riskLevel = "LOW";
    if (riskScore >= 50) {
      riskLevel = "HIGH";
    } else if (riskScore >= 20) {
      riskLevel = "MEDIUM";
    }

    const report = {
      risk_level: riskLevel,
      threat_score: Math.min(100, riskScore),
      red_flags: redFlags.length > 0 ? redFlags : ["No overt phishing indicators detected."],
      url_reports: urlReports.length > 0 ? urlReports : ["No external URLs found in message body."],
      heuristic_summary: {
        urgency_triggers: /\b(urgent|immediate|suspended|action required)\b/i.test(rawText),
        links_detected: foundUrls.length,
        payload_length: rawText.length,
        ml_model_confidence: `NLP Heuristics Confidence: ${Math.min(100, riskScore)}%`
      }
    };

    return {
      status: "success",
      report: report,
      data: report
    };
  } catch (error: any) {
    console.error("Email Analysis Error:", error);
    return { status: "error", error: error?.message || "Email Analysis Failed." };
  }
}