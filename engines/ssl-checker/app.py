import socket
import ssl
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/check-ssl', methods=['POST'])
def check_ssl():
    data = request.get_json() or {}
    domain = data.get('domain', '').strip()

    if not domain:
        return jsonify({"error": "No domain specified"}), 400

    # Clean domain
    domain_clean = domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]

    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((domain_clean, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain_clean) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()

                # Parse dates
                not_before = cert.get('notBefore')
                not_after = cert.get('notAfter')
                
                valid_from_dt = datetime.datetime.strptime(not_before, '%b %d %H:%M:%S %Y %Z') if not_before else None
                valid_to_dt = datetime.datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z') if not_after else None
                
                days_left = (valid_to_dt - datetime.datetime.utcnow()).days if valid_to_dt else 0
                is_valid = days_left > 0

                # Extract subject & issuer
                subject_dict = dict(x[0] for x in cert.get('subject', []))
                issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                sans = [item[1] for item in cert.get('subjectAltName', []) if item[0] == 'DNS']

                report = {
                    "domain": domain_clean,
                    "is_valid": is_valid,
                    "status": "VALID" if is_valid else "EXPIRED",
                    "subject": subject_dict.get('commonName', domain_clean),
                    "issuer": issuer_dict.get('organizationName', issuer_dict.get('commonName', 'Unknown')),
                    "valid_from": not_before,
                    "valid_to": not_after,
                    "days_remaining": days_left,
                    "protocol_version": version,
                    "cipher_suite": cipher[0] if cipher else "Unknown",
                    "key_strength": f"{cipher[2]} bits" if cipher and len(cipher) > 2 else "256 bits",
                    "san_count": len(sans),
                    "subject_alt_names": sans[:10]
                }

                return jsonify({
                    "status": "success",
                    "report": report,
                    "data": report
                }), 200

    except ssl.SSLCertVerificationError as e:
        return jsonify({
            "status": "error",
            "error": f"SSL Certificate Verification Failed: {str(e)}",
            "domain": domain_clean
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Connection/SSL Handshake Error: {str(e)}",
            "domain": domain_clean
        }), 400

if __name__ == '__main__':
    print("🔒 SSL/TLS Checker Microservice live on port 5006...")
    app.run(host='0.0.0.0', port=5006)
