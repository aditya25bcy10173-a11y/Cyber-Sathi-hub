import os
import sys
import re
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SUSPICIOUS_TLDS = {'.xyz', '.top', '.club', '.work', '.click', '.loan', '.fit', '.gq', '.cf', '.tk', '.ml', '.cc', '.buzz'}
SUSPICIOUS_KEYWORDS = {
    'login', 'verify', 'update', 'banking', 'secure', 'account', 'recover',
    'signin', 'paypal', 'apple', 'google', 'wallet', 'crypto', 'bonus', 'free', 'kyc',
    'support', 'claim', 'service', 'validation', 'authenticate', 'password', 'webscr'
}

# Try loading trained ML joblib model if available
ml_model = None
ml_features = None

try:
    import joblib
    import pandas as pd
    model_paths = [
        os.path.join(os.path.dirname(__file__), "url fishing detetctor", "model.joblib"),
        os.path.join(os.path.dirname(__file__), "model.joblib")
    ]
    for p in model_paths:
        if os.path.exists(p):
            bundle = joblib.load(p)
            ml_model = bundle.get('model')
            ml_features = bundle.get('features')
            print(f"✅ Loaded ML Model from {p}")
            break
except Exception as e:
    print(f"ℹ️ ML Model offline ({e}), utilizing heuristic rules engine.")

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
    hostname = (parsed.hostname or parsed.netloc.split(':')[0] or '').lower()
    path = parsed.path or ''
    query = parsed.query or ''

    flags = []
    risk_score = 0

    # 1. IP as hostname
    is_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname))
    if is_ip:
        flags.append("Direct IP address used instead of domain name")
        risk_score += 40

    # 2. Suspicious TLD
    matched_tld = [tld for tld in SUSPICIOUS_TLDS if hostname.endswith(tld)]
    if matched_tld:
        flags.append(f"Domain uses high-abuse TLD ({matched_tld[0]})")
        risk_score += 25

    # 3. Excessive subdomains
    subdomain_count = max(0, len(hostname.split('.')) - 2) if not is_ip else 0
    if subdomain_count > 2:
        flags.append(f"Excessive subdomain nesting detected ({subdomain_count} subdomains)")
        risk_score += 20

    # 4. Phishing keywords
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in hostname or kw in path.lower() or kw in query.lower()]
    if found_keywords:
        flags.append(f"Target contains credential harvesting keywords: {', '.join(found_keywords)}")
        risk_score += 30

    # 5. Length & Obfuscation
    if len(raw_url) > 90:
        flags.append(f"Anomalous URL length ({len(raw_url)} characters)")
        risk_score += 15

    if '@' in raw_url:
        flags.append("Presence of '@' character indicates credential obfuscation")
        risk_score += 35

    is_https = raw_url.startswith('https://')
    if not is_https:
        flags.append("Non-secure HTTP transport protocol detected")
        risk_score += 10

    # ML Inference if loaded
    ml_verdict = None
    if ml_model is not None and ml_features is not None:
        try:
            import pandas as pd
            tld = hostname.split('.')[-1] if '.' in hostname else ''
            row = {col: 0 for col in ml_features}
            row['URLLength'] = len(raw_url)
            row['DomainLength'] = len(hostname)
            row['IsDomainIP'] = 1 if is_ip else 0
            row['TLDLength'] = len(tld)
            row['NoOfSubDomain'] = subdomain_count
            row['HasObfuscation'] = 1 if ('%' in raw_url or '@' in raw_url) else 0
            row['IsHTTPS'] = 1 if is_https else 0
            df = pd.DataFrame([row], columns=ml_features)
            pred = ml_model.predict(df)[0]
            probs = ml_model.predict_proba(df)[0]
            ml_risk = probs[0] * 100
            ml_verdict = f"ML Model Risk Score: {ml_risk:.1f}%"
            if pred == 0:  # Phishing
                risk_score = max(risk_score, int(ml_risk))
                flags.append(f"Random Forest ML Classifier flagged URL as Phishing ({ml_risk:.1f}% confidence)")
        except Exception as e:
            print("ML Inference Error:", e)

    # Severity determination
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
            "ip_host": is_ip,
            "high_risk_tld": bool(matched_tld),
            "credential_target_terms": found_keywords,
            "url_length": len(raw_url),
            "ml_analysis": ml_verdict
        }
    }

    return jsonify({
        "status": "success",
        "threat_assessment": assessment,
        "report": assessment
    }), 200

if __name__ == '__main__':
    print("🌐 Sentinel URL Threat Detector is live on port 5001...")
    app.run(host='0.0.0.0', port=5001)
