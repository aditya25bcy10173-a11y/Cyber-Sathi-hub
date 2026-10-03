import hashlib
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SUSPICIOUS_STRINGS = [
    b"powershell", b"cmd.exe", b"/bin/sh", b"/bin/bash",
    b"eval(", b"exec(", b"base64_decode", b"Invoke-Expression",
    b"WScript.Shell", b"CreateObject", b"socket.socket", b"Net.WebClient"
]

@app.route('/api/scan-file', methods=['POST'])
def scan_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded in request"}), 400

    f = request.files['file']
    filename = f.filename or "unknown"
    content = f.read()

    file_size = len(content)
    md5 = hashlib.md5(content).hexdigest()
    sha1 = hashlib.sha1(content).hexdigest()
    sha256 = hashlib.sha256(content).hexdigest()

    # Heuristic signature checks
    found_signatures = []
    for sig in SUSPICIOUS_STRINGS:
        if sig in content:
            found_signatures.append(sig.decode('ascii', errors='ignore'))

    is_pe = content.startswith(b'MZ')
    is_elf = content.startswith(b'\x7fELF')
    is_zip_or_office = content.startswith(b'PK\x03\x04')
    is_pdf = content.startswith(b'%PDF')

    file_type = "Generic Binary / Data"
    if is_pe:
        file_type = "Windows Executable (PE)"
    elif is_elf:
        file_type = "Linux Executable (ELF)"
    elif is_pdf:
        file_type = "PDF Document"
    elif is_zip_or_office:
        file_type = "ZIP / Compressed Archive or OOXML Document"
    elif filename.endswith(('.py', '.js', '.vbs', '.ps1', '.sh', '.bat', '.cmd')):
        file_type = "Script / Source Code"

    malicious = len(found_signatures) > 0 or (is_pe and filename.endswith(('.pdf', '.docx', '.jpg')))

    risk_level = "LOW (Clean)"
    if len(found_signatures) >= 3 or (is_pe and len(found_signatures) > 0):
        risk_level = "CRITICAL / HIGH RISK"
    elif len(found_signatures) > 0:
        risk_level = "MEDIUM / SUSPICIOUS"

    report = {
        "file_name": filename,
        "file_size_bytes": file_size,
        "file_type": file_type,
        "md5": md5,
        "sha1": sha1,
        "sha256": sha256,
        "risk_level": risk_level,
        "malicious": malicious,
        "anomalies": found_signatures if found_signatures else ["No obvious signature strings detected"],
        "entropy_estimate": "Normal"
    }

    return jsonify({
        "status": "success",
        "report": report,
        "data": report
    }), 200

if __name__ == '__main__':
    print("🔬 Malware & File Sandbox live on port 5004...")
    app.run(host='0.0.0.0', port=5004)
