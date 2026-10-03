"use server"

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.work', '.click', '.loan', '.fit', '.gq', '.cf', '.tk', '.ml', '.cc', '.buzz'];
const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'update', 'banking', 'secure', 'account', 'recover',
  'signin', 'paypal', 'apple', 'google', 'wallet', 'crypto', 'bonus', 'free', 'kyc',
  'support', 'claim', 'service', 'validation', 'authenticate', 'password', 'webscr'
];

export interface UrlAnalysisResponse {
  status: "success" | "error";
  threat_assessment?: any;
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeUrl(targetUrl: string): Promise<UrlAnalysisResponse> {
  try {
    const rawUrl = (targetUrl || '').trim();
    if (!rawUrl) {
      return { status: "error", error: "No URL provided" };
    }

    const normalizedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
      ? rawUrl 
      : 'http://' + rawUrl;

    let parsed: URL;
    try {
      parsed = new URL(normalizedUrl);
    } catch {
      return { status: "error", error: "Invalid URL format provided." };
    }

    const hostname = (parsed.hostname || '').toLowerCase();
    const pathname = parsed.pathname || '';
    const search = parsed.search || '';

    const flags: string[] = [];
    let riskScore = 0;

    // 1. IP as hostname
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (isIp) {
      flags.push("Direct IP address used instead of domain name");
      riskScore += 40;
    }

    // 2. Suspicious TLD
    const matchedTld = SUSPICIOUS_TLDS.filter(tld => hostname.endsWith(tld));
    if (matchedTld.length > 0) {
      flags.push(`Domain uses high-abuse TLD (${matchedTld[0]})`);
      riskScore += 25;
    }

    // 3. Excessive subdomains
    const subdomainParts = hostname.split('.');
    const subdomainCount = isIp ? 0 : Math.max(0, subdomainParts.length - 2);
    if (subdomainCount > 2) {
      flags.push(`Excessive subdomain nesting detected (${subdomainCount} subdomains)`);
      riskScore += 20;
    }

    // 4. Phishing keywords
    const lowerFull = (hostname + pathname + search).toLowerCase();
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => lowerFull.includes(kw));
    if (foundKeywords.length > 0) {
      flags.push(`Target contains credential harvesting keywords: ${foundKeywords.join(', ')}`);
      riskScore += 30;
    }

    // 5. Length & Obfuscation
    if (rawUrl.length > 90) {
      flags.push(`Anomalous URL length (${rawUrl.length} characters)`);
      riskScore += 15;
    }

    if (rawUrl.includes('@')) {
      flags.push("Presence of '@' character indicates credential obfuscation");
      riskScore += 35;
    }

    const isHttps = rawUrl.startsWith('https://');
    if (!isHttps) {
      flags.push("Non-secure HTTP transport protocol detected");
      riskScore += 10;
    }

    let severity = "LOW";
    let verdict = "SAFE / LOW RISK";
    if (riskScore >= 50) {
      severity = "HIGH";
      verdict = "MALICIOUS / PHISHING SUSPECT";
    } else if (riskScore >= 25) {
      severity = "MEDIUM";
      verdict = "SUSPICIOUS HEURISTICS";
    }

    const assessment = {
      url: rawUrl,
      domain: hostname,
      protocol: isHttps ? "HTTPS" : "HTTP",
      severity: severity,
      threat_score: Math.min(100, riskScore),
      verdict: verdict,
      anomalies_detected: flags.length > 0 ? flags : ["No suspicious heuristics detected."],
      heuristic_signals: {
        ip_host: isIp,
        high_risk_tld: matchedTld.length > 0,
        credential_target_terms: foundKeywords,
        url_length: rawUrl.length,
        ml_analysis: `Heuristic & Pattern Detection Engine: ${Math.min(100, riskScore)}% confidence`
      }
    };

    return {
      status: "success",
      threat_assessment: assessment,
      report: assessment,
      data: assessment
    };
  } catch (error: any) {
    console.error("URL Analysis Error:", error);
    return { status: "error", error: error?.message || "URL Scan Failed." };
  }
}