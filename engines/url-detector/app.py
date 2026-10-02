import re
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SUSPICIOUS_TLDS = {'.xyz', '.top', '.club', '.work', '.click', '.loan', '.fit', '.gq', '.cf', '.tk', '.ml'}
SUSPICIOUS_KEYWORDS = {
    'login', 'verify', 'update', 'banking', 'secure', 'account', 'recover',
    'signin', 'paypal', 'apple', 'google', 'wallet', 'crypto', 'bonus', 'free', 'kyc'
}

@app.route('/api/scan-url', methods=['POST'])
def scan_url():
    data = request.get_json() or {}
    raw_url = data.get('url', '').strip()

    if not raw_url:
        return jsonify({"error": "No URL provided"}), 400

    if not raw_url.startswith(('http://', 'https://')):
        normalized_url = 'http://' + raw_url
    else:
        normalized_url = raw_url

    parsed = urllib.parse.urlparse(normalized_url)
    hostname = parsed.hostname or ''
    path = parsed.path or ''
    query = parsed.query or ''

    flags = []
    risk_score = 0

    # 1. IP as hostname
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
        flags.append("Direct IP address used instead of legitimate domain name")
        risk_score += 40

    # 2. Suspicious TLD
    matched_tld = [tld for tld in SUSPICIOUS_TLDS if hostname.endswith(tld)]
    if matched_tld:
        flags.append(f"Domain uses high-abuse TLD ({matched_tld[0]})")
        risk_score += 25

    # 3. Excessive subdomains
    subdomain_count = hostname.count('.')
    if subdomain_count > 3:
        flags.append(f"Excessive subdomain nesting detected ({subdomain_count} dots)")
        risk_score += 20

    # 4. Phishing keywords in subdomain or path
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in hostname.lower() or kw in path.lower()]
    if found_keywords:
        flags.append(f"Target contains credential harvesting keywords: {', '.join(found_keywords)}")
        risk_score += 30

    # 5. Excessive length or character entropy
    if len(raw_url) > 100:
        flags.append(f"Anomalous URL length ({len(raw_url)} characters)")
        risk_score += 15

    # 6. At sign or redirection character
    if '@' in raw_url:
        flags.append("Presence of '@' character indicates credential obfuscation")
        risk_score += 35

    # 7. Protocol check
    is_https = raw_url.startswith('https://')
    if not is_https:
        flags.append("Non-secure HTTP transport protocol detected")
        risk_score += 10

    # Determine severity
    if risk_score >= 50:
        severity = "HIGH"
        verdict = "MALICIOUS / PHISHING SUSPECT"
    elif risk_score >= 25:
        severity = "MEDIUM"
        verdict = "SUSPICIOUS HEURISTICS"
    else:
        severity = "LOW"
        verdict = "SAFE / LOW RISK"

    assessment = {
        "url": raw_url,
        "domain": hostname,
        "protocol": "HTTPS" if is_https else "HTTP",
        "severity": severity,
        "threat_score": min(100, risk_score),
        "verdict": verdict,
        "anomalies_detected": flags if flags else ["No suspicious heuristics detected."],
        "heuristic_signals": {
            "ip_host": bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname)),
            "high_risk_tld": bool(matched_tld),
            "credential_target_terms": found_keywords,
            "url_length": len(raw_url)
        }
    }

    return jsonify({
        "status": "success",
        "threat_assessment": assessment
    }), 200

if __name__ == '__main__':
    print("🌐 Sentinel Heuristic URL Scanner is live on port 5001...")
    app.run(host='0.0.0.0', port=5001)
