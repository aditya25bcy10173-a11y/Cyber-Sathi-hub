import os
import sys
import re
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PHISHING_KEYWORDS = [
    (r'\b(urgent|immediate action|account suspended|verify now|unauthorized access|security breach|action required|final notice)\b', "Artificial urgency or panic inducement detected"),
    (r'\b(bank|wire transfer|gift card|crypto|bitcoin|inheritance|lottery|winner|prize|claim reward|cash prize)\b', "Financial / monetary solicitation flags"),
    (r'\b(update your password|click here|confirm identity|reset credentials|verify login|validate account)\b', "Direct credential harvesting call-to-action"),
    (r'\b(irs|police|tax|legal action|arrest warrant|court|fbi|customs|income tax department)\b', "Government or authority impersonation language"),
    (r'\b(dear customer|dear user|valued member|dear citizen|undisclosed recipients)\b', "Generic salutation common in mass phishing campaigns")
]

URL_REGEX = r'https?://[^\s<>"]+|www\.[^\s<>"]+'

# Attempt to load ML TFIDF / Keras Model if available
vectorizer = None
keras_model = None

try:
    import joblib
    vec_path = os.path.join(os.path.dirname(__file__), "tfidf_vectorizer.joblib")
    if os.path.exists(vec_path):
        vectorizer = joblib.load(vec_path)
        print("✅ Loaded TFIDF vectorizer for Email detector")
    
    keras_path = os.path.join(os.path.dirname(__file__), "mal_email_detector.keras")
    if os.path.exists(keras_path):
        try:
            import tensorflow as tf
            keras_model = tf.keras.models.load_model(keras_path)
            print("✅ Loaded Keras Deep Learning Email Model")
        except Exception as ke:
            print(f"ℹ️ TensorFlow not loaded ({ke}), falling back to NLP heuristics.")
except Exception as e:
    print(f"ℹ️ ML Vectorizer not loaded ({e}), using NLP heuristics.")

@app.route('/api/analyze-email', methods=['POST'])
def analyze_email():
    data = request.get_json() or {}
    email_text = data.get('email_text', '').strip()

    if not email_text:
        return jsonify({"error": "No email text provided in payload"}), 400

    red_flags = []
    risk_score = 0

    # 1. Heuristic Pattern Matching
    lower_text = email_text.lower()
    for pattern, description in PHISHING_KEYWORDS:
        matches = re.findall(pattern, lower_text)
        if matches:
            red_flags.append(f"{description} (matched: {', '.join(set(matches[:3]))})")
            risk_score += 25

    # 2. Extract Embedded Links
    found_urls = re.findall(URL_REGEX, email_text)
    url_reports = []
    for u in found_urls:
        parsed = urllib.parse.urlparse(u if u.startswith('http') else 'http://' + u)
        domain = parsed.hostname or u
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain):
            url_reports.append(f"[CRITICAL] Embedded link points to raw IP ({domain})")
            risk_score += 30
        elif any(domain.endswith(tld) for tld in ['.xyz', '.top', '.tk', '.click', '.buzz']):
            url_reports.append(f"[SUSPICIOUS] Embedded link uses high-abuse TLD ({domain})")
            risk_score += 20
        else:
            url_reports.append(f"[INSPECTED] Link extracted: {u}")

    # 3. Optional ML Inference
    ml_confidence = None
    if vectorizer is not None and keras_model is not None:
        try:
            vec = vectorizer.transform([email_text]).toarray()
            prob = float(keras_model.predict(vec)[0][0])
            ml_confidence = round(prob * 100, 2)
            if prob > 0.5:
                risk_score = max(risk_score, int(ml_confidence))
                red_flags.append(f"Deep Learning Neural Network flagged email as Phishing/Spam ({ml_confidence}% confidence)")
        except Exception as mle:
            print("ML Prediction Error:", mle)

    # 4. Overall Risk Level
    if risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    report = {
        "risk_level": risk_level,
        "threat_score": min(100, risk_score),
        "red_flags": red_flags if red_flags else ["No overt phishing indicators detected."],
        "url_reports": url_reports if url_reports else ["No external URLs found in message body."],
        "heuristic_summary": {
            "urgency_triggers": bool(re.search(r'\b(urgent|immediate|suspended|action required)\b', lower_text)),
            "links_detected": len(found_urls),
            "payload_length": len(email_text),
            "ml_model_confidence": f"{ml_confidence}%" if ml_confidence is not None else "Heuristic Rule Engine Active"
        }
    }

    return jsonify({
        "status": "success",
        "report": report
    }), 200

if __name__ == '__main__':
    print("✉️ Sentinel Mal-Email Detector is live on port 5008...")
    app.run(host='0.0.0.0', port=5008)
