import math
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def calculate_entropy(password: str) -> float:
    if not password:
        return 0.0
    charset = 0
    if re.search(r'[a-z]', password):
        charset += 26
    if re.search(r'[A-Z]', password):
        charset += 26
    if re.search(r'[0-9]', password):
        charset += 10
    if re.search(r'[^a-zA-Z0-9]', password):
        charset += 32
    if charset == 0:
        charset = 1
    return round(len(password) * math.log2(charset), 2)

def estimate_crack_time(entropy: float) -> str:
    # Assuming 100 billion guesses/second (modern GPU cluster)
    guesses = 2 ** entropy
    seconds = guesses / 1e11
    if seconds < 1:
        return "Instant (< 1 second)"
    elif seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours"
    elif seconds < 31536000:
        return f"{int(seconds // 86400)} days"
    elif seconds < 31536000 * 100:
        return f"{int(seconds // 31536000)} years"
    elif seconds < 31536000 * 10000:
        return f"{int(seconds // 31536000):,} years"
    else:
        return "Centuries (Resilient to Brute-Force)"

COMMON_PASSWORDS = {
    "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
    "1234567", "dragon", "welcome", "admin", "admin123", "root", "toor", "pass1234", "iloveyou"
}

@app.route('/api/analyze-password', methods=['POST'])
def analyze_password():
    data = request.get_json() or {}
    password = data.get('password', '')
    
    if not password:
        return jsonify({"error": "No password string provided"}), 400

    length = len(password)
    entropy = calculate_entropy(password)
    crack_time = estimate_crack_time(entropy)

    has_lower = bool(re.search(r'[a-z]', password))
    has_upper = bool(re.search(r'[A-Z]', password))
    has_digit = bool(re.search(r'[0-9]', password))
    has_symbol = bool(re.search(r'[^a-zA-Z0-9]', password))

    feedback = []
    if length < 8:
        feedback.append("Length is critically low; use at least 12 characters.")
    elif length < 12:
        feedback.append("Consider extending length to 16+ characters for quantum resistance.")
    if not has_upper:
        feedback.append("Include uppercase characters (A-Z).")
    if not has_digit:
        feedback.append("Include numeric digits (0-9).")
    if not has_symbol:
        feedback.append("Include special symbols (!@#$%^&*).")

    is_leaked = password.lower() in COMMON_PASSWORDS
    if is_leaked:
        feedback.insert(0, "CRITICAL: Password matches common compromised credential dictionaries!")

    # Calculate score 0 - 100
    score = min(100, int((entropy / 80.0) * 100))
    if is_leaked:
        score = min(score, 15)

    if score >= 80:
        strength = "VERY STRONG"
    elif score >= 60:
        strength = "STRONG"
    elif score >= 40:
        strength = "MODERATE"
    elif score >= 20:
        strength = "WEAK"
    else:
        strength = "VERY WEAK"

    report = {
        "status": "success",
        "length": length,
        "entropy_bits": entropy,
        "strength_level": strength,
        "security_score": score,
        "crack_time_estimate": crack_time,
        "character_breakdown": {
            "lowercase": has_lower,
            "uppercase": has_upper,
            "numbers": has_digit,
            "special_characters": has_symbol
        },
        "breach_check": {
            "found_in_common_leaks": is_leaked,
            "threat_verdict": "COMPROMISED" if is_leaked else "NOT_FOUND_IN_COMMON_DICTS"
        },
        "hardening_recommendations": feedback if feedback else ["Password meets high cryptographic entropy standards."]
    }

    return jsonify({
        "status": "success",
        "report": report
    }), 200

if __name__ == '__main__':
    print("🔑 Sentinel Password Entropy Engine is live on port 5000...")
    app.run(host='0.0.0.0', port=5000)
