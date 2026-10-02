import re
import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from hash_identifier import identify_hash, HASH_DB

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze-hash', methods=['POST'])
def analyze_hash_endpoint():
    data = request.get_json() or {}
    hash_string = data.get('hash', '').strip()

    if not hash_string:
        return jsonify({"error": "No hash provided in payload"}), 400

    matches = identify_hash(hash_string)
    
    # Priority sorting for likely candidates
    priority_order = [
        "MD5", "SHA-1", "SHA-256", "SHA-512", "SHA-224", "SHA-384",
        "bcrypt", "NTLM", "MySQL 4.x/5.x", "SHA3-256", "SHA3-512",
    ]
    def sort_key(item):
        name = item["algorithm"]
        if name in priority_order:
            return (0, priority_order.index(name))
        return (1, name)

    matches.sort(key=sort_key)
    algo_names = [m["algorithm"] for m in matches]

    # Vulnerability rating based on algorithms
    vulnerability = "Unknown"
    if any(a in algo_names for a in ["MD2", "MD4", "MD5", "LM Hash"]):
        vulnerability = "CRITICAL (Cryptographically Broken / Obsolete)"
    elif any(a in algo_names for a in ["SHA-1", "RIPEMD-160"]):
        vulnerability = "HIGH (Collision Deprecated)"
    elif any(a in algo_names for a in ["SHA-256", "SHA-512", "SHA3-256", "SHA3-512", "Whirlpool"]):
        vulnerability = "LOW (Current Industry Standard)"
    elif any(a in algo_names for a in ["bcrypt"]):
        vulnerability = "VERY LOW (Strong Key Derivation)"

    report = {
        "hash": hash_string,
        "length": len(hash_string),
        "status": "Identified" if matches else "Unknown Format",
        "algorithms": algo_names if algo_names else ["Unrecognized"],
        "matches": matches,
        "vulnerability": vulnerability,
        "match_count": len(matches)
    }

    return jsonify({
        "status": "success",
        "forensic_report": report
    }), 200

if __name__ == '__main__':
    print("🔐 Hash Identifier Microservice is live on port 5002...")
    app.run(host='0.0.0.0', port=5002)
