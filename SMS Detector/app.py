import os
import sys
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from text_utils import clean

app = Flask(__name__)
CORS(app)

model = None
try:
    import joblib
    model_path = os.path.join(os.path.dirname(__file__), "sms_classifier.joblib")
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("✅ Loaded SMS classifier joblib model")
except Exception as e:
    print(f"ℹ️ SMS Model not loaded ({e}), using heuristic SMS analyzer.")

SMISHING_PATTERNS = [
    (r'\b(otp|one time password|verification code|pin|cvv)\b', "Requests sensitive authentication token/OTP"),
    (r'\b(blocked|suspended|deactivated|kyc expired|pan linked|electricity disconnected)\b', "Urgent financial or utility blockage threat"),
    (r'\b(won|lottery|prize|cashback|credited|reward points|claim now)\b', "Lure with fake rewards or cashback"),
    (r'\b(apk|download app|click link|bit\.ly|tinyurl|wa\.me|t\.me)\b', "Suspicious link or malicious APK payload")
]

@app.route('/api/scan-sms', methods=['POST'])
def scan_sms():
    data = request.get_json() or {}
    message = data.get('message', '').strip() or data.get('text', '').strip()

    if not message:
        return jsonify({"error": "No SMS text provided"}), 400

    cleaned = clean(message)
    flags = []
    risk_score = 0

    for pat, desc in SMISHING_PATTERNS:
        if re.search(pat, message, re.IGNORECASE):
            flags.append(desc)
            risk_score += 25

    # Check for short links or APK
    if re.search(r'https?://\S+|\b(?:bit\.ly|t\.me|wa\.me|tinyurl\.com)/\S+', message, re.I):
        flags.append("Contains short/obfuscated link commonly used in smishing")
        risk_score += 30

    ml_result = None
    if model is not None:
        try:
            pred = model.predict([cleaned])[0]
            # If model supports predict_proba
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba([cleaned])[0]
                spam_prob = round(float(probs[1] if len(probs) > 1 else probs[0]) * 100, 2)
                ml_result = f"ML Classification: {'SPAM / SMISHING' if pred == 1 or pred == 'spam' else 'HAM / SAFE'} ({spam_prob}%)"
                if pred == 1 or pred == 'spam':
                    risk_score = max(risk_score, int(spam_prob))
            else:
                is_spam = pred == 1 or str(pred).lower() == 'spam'
                ml_result = f"ML Prediction: {'SPAM / FRAUD' if is_spam else 'LEGITIMATE'}"
                if is_spam:
                    risk_score = max(risk_score, 80)
        except Exception as e:
            print("SMS ML error:", e)

    if risk_score >= 50:
        verdict = "FRAUDULENT / SMISHING DETECTED"
        severity = "HIGH"
    elif risk_score >= 25:
        verdict = "SUSPICIOUS SMS"
        severity = "MEDIUM"
    else:
        verdict = "CLEAN / LEGITIMATE"
        severity = "LOW"

    report = {
        "status": "success",
        "original_message": message,
        "cleaned_tokens": cleaned,
        "severity": severity,
        "risk_score": min(100, risk_score),
        "verdict": verdict,
        "indicators": flags if flags else ["No smishing indicators detected."],
        "ml_analysis": ml_result or "Heuristic NLP Engine"
    }

    return jsonify({
        "status": "success",
        "report": report,
        "data": report
    }), 200

if __name__ == '__main__':
    print("📱 Sentinel SMS / Smishing Detector is live on port 5007...")
    app.run(host='0.0.0.0', port=5007)
