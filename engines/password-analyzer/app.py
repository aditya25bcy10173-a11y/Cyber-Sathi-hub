import math
import re
import string
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

COMMON_PASSWORDS = {
    "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
    "1234567", "dragon", "welcome", "admin", "admin123", "root", "toor", "pass1234",
    "iloveyou", "princess", "rockyou", "monkey", "sunshine", "charlie", "donald",
    "football", "shadow", "master", "superman", "batman", "trustno1", "letmein",
    "starwars", "pokemon", "654321", "computer", "access", "secret", "system",
    "security", "qwertyuiop", "asdfghjkl", "zxcvbnm", "password1", "password123",
    "p@ssword", "p@ssw0rd", "pass123", "admin2024", "admin2025", "admin2026",
    "hunter2", "login123", "pass@123", "testing@123", "welcome@123", "india@123"
}

def calculate_entropy(password):
    if not password:
        return 0.0
    charset_size = 0
    if any(c.islower() for c in password):
        charset_size += 26
    if any(c.isupper() for c in password):
        charset_size += 26
    if any(c.isdigit() for c in password):
        charset_size += 10
    if any(c in string.punctuation for c in password):
        charset_size += len(string.punctuation)
    if not charset_size:
        charset_size = 256
    return round(len(password) * math.log2(charset_size), 2)

@app.route('/api/analyze-password', methods=['POST'])
def analyze_password():
    data = request.get_json() or {}
    password = data.get('password', '')

    if not password:
        return jsonify({"error": "No password provided"}), 400

    length = len(password)
    has_lower = bool(re.search(r'[a-z]', password))
    has_upper = bool(re.search(r'[A-Z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[^a-zA-Z0-9]', password))

    is_common = password.lower() in COMMON_PASSWORDS
    entropy = calculate_entropy(password)

    score = 0
    if length >= 8:
        score += 20
    if length >= 12:
        score += 20
    if length >= 16:
        score += 10
    if has_lower and has_upper:
        score += 20
    if has_digit:
        score += 15
    if has_special:
        score += 15

    if is_common:
        score = min(score, 15)

    if score >= 80:
        strength = "VERY STRONG"
        crack_time = "Centuries"
    elif score >= 60:
        strength = "STRONG"
        crack_time = "Years"
    elif score >= 40:
        strength = "MODERATE"
        crack_time = "Days to Months"
    elif score >= 20:
        strength = "WEAK"
        crack_time = "Minutes to Hours"
    else:
        strength = "CRITICAL / VERY WEAK"
        crack_time = "Instantaneous"

    report = {
        "length": length,
        "entropy_bits": entropy,
        "strength_score": score,
        "strength_label": strength,
        "estimated_crack_time": crack_time,
        "is_common_password": is_common,
        "checks": {
            "has_lowercase": has_lower,
            "has_uppercase": has_upper,
            "has_digits": has_digit,
            "has_special_chars": has_special,
            "min_length_met": length >= 8
        }
    }

    return jsonify({
        "status": "success",
        "report": report,
        "data": report
    }), 200

if __name__ == '__main__':
    print("🔑 Password Analyzer Microservice live on port 5000...")
    app.run(host='0.0.0.0', port=5000)
