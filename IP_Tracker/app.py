from flask import Flask, request, jsonify
from flask_cors import CORS
from ip_tracker import get_ip_info, resolve_hostname, get_my_ip

app = Flask(__name__)
CORS(app)

@app.route('/api/check-ip', methods=['POST'])
def check_ip_endpoint():
    data = request.get_json() or {}
    target = data.get('ip', '').strip()

    if not target:
        return jsonify({"error": "No IP address provided"}), 400

    if target.lower() == 'me':
        ip = get_my_ip() or "127.0.0.1"
    else:
        ip = resolve_hostname(target)

    info = get_ip_info(ip)
    if not info:
        return jsonify({"error": f"Failed to retrieve data for target {target}"}), 500

    if info.get("status") == "fail":
        return jsonify({"error": info.get("message", "IP lookup failed")}), 400

    # Format into consistent structure for dashboard
    report = {
        "status": "success",
        "ip": info.get("query", ip),
        "target_input": target,
        "resolved_ip": ip,
        "geo": {
            "country": info.get("country"),
            "countryCode": info.get("countryCode"),
            "region": info.get("regionName"),
            "city": info.get("city"),
            "zip": info.get("zip"),
            "lat": info.get("lat"),
            "lon": info.get("lon"),
            "timezone": info.get("timezone"),
            "maps_url": f"https://www.google.com/maps?q={info.get('lat')},{info.get('lon')}" if info.get('lat') else None
        },
        "network": {
            "isp": info.get("isp"),
            "organization": info.get("org"),
            "as": info.get("as"),
            "asname": info.get("asname")
        },
        "security_flags": {
            "mobile": info.get("mobile", False),
            "proxy_vpn": info.get("proxy", False),
            "hosting_dc": info.get("hosting", False),
            "threat_status": "SUSPICIOUS" if info.get("proxy") else "CLEAN"
        }
    }

    return jsonify({
        "status": "success",
        "data": report,
        "report": report
    }), 200

if __name__ == '__main__':
    print("🌐 IP Tracker Microservice is live on port 5005...")
    app.run(host='0.0.0.0', port=5005)
