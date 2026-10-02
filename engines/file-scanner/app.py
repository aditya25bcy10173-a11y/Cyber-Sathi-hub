from flask import Flask, request, jsonify
from flask_cors import CORS  # <--- 1. ADD THIS IMPORT
from scanner import scan_file_hash
import hashlib

app = Flask(__name__)

@app.route('/api/scan-file', methods=['POST'])
def scan_file_endpoint():
    # 1. Check if the user actually attached a file
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    # 2. IN-MEMORY HASHING (Super Secure & Fast)
    # We read the file's bytes directly in RAM without saving it to disk
    file_bytes = file.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    
    # 3. Query the Threat Intel Engine
    report = scan_file_hash(file_hash)
    
    # 4. Compile the final Master Report
    report["file_hash"] = file_hash
    report["filename"] = file.filename
    
    return jsonify({
        "status": "success",
        "malware_report": report
    }), 200

if __name__ == '__main__':
    print("🦠 Sentinel File Scanner API is live on port 5004...")
    # Port 5004 keeps it separated from Phases 1, 2, 3, 4, and 5!
    app.run(host='0.0.0.0', port=5004)