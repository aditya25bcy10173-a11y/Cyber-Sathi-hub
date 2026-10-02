import ssl
import socket
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/check-ssl', methods=['POST'])
def check_ssl():
    data = request.get_json() or {}
    domain = data.get('domain', '').strip()
    clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]

    if not clean_domain:
        return jsonify({"error": "No domain provided"}), 400

    context = ssl.create_default_context()
    try:
        with socket.create_connection((clean_domain, 443), timeout=5.0) as sock:
            with context.wrap_socket(sock, server_hostname=clean_domain) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                tls_version = ssock.version()

        # Parse cert details
        subject = dict(x[0] for x in cert.get('subject', []))
        issuer = dict(x[0] for x in cert.get('issuer', []))
        
        not_before_str = cert.get('notBefore')
        not_after_str = cert.get('notAfter')
        
        # Formats: 'May 10 12:00:00 2026 GMT'
        date_fmt = r'%b %d %H:%M:%S %Y %Z'
        not_after = datetime.datetime.strptime(not_after_str, date_fmt)
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        
        days_remaining = (not_after - now).days
        is_valid = days_remaining > 0

        sans = [item[1] for item in cert.get('subjectAltName', []) if item[0] == 'DNS']

        report = {
            "status": "success",
            "domain": clean_domain,
            "valid": is_valid,
            "days_until_expiry": max(0, days_remaining),
            "valid_from": not_before_str,
            "valid_to": not_after_str,
            "issuer_organization": issuer.get('organizationName', 'Unknown'),
            "common_name": subject.get('commonName', clean_domain),
            "tls_protocol": tls_version,
            "cipher_suite": cipher[0] if cipher else "Unknown",
            "san_count": len(sans),
            "subject_alt_names": sans[:10],
            "health_verdict": "SECURE" if is_valid and days_remaining > 14 else "RENEW_URGENT" if is_valid else "EXPIRED"
        }

        return jsonify({
            "status": "success",
            "report": report
        }), 200

    except Exception as e:
        return jsonify({
            "error": f"Failed to inspect SSL for {clean_domain}: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🔒 Sentinel SSL Cryptographic Engine is live on port 5006...")
    app.run(host='0.0.0.0', port=5006)
