import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner import PortScanner, PortState

app = Flask(__name__)
CORS(app)

DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 1433, 3306, 3389, 5432, 6379, 8080, 8443]

@app.route('/api/scan-ports', methods=['POST'])
def scan_ports_endpoint():
    data = request.get_json() or {}
    target = data.get('target', '').strip()
    target_clean = target.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]

    if not target_clean:
        return jsonify({"error": "No target host specified"}), 400

    try:
        scanner = PortScanner(target=target_clean, timeout=0.8, concurrency=50, grab_banner=True)
        resolved_ip = scanner.resolve_target()
        
        # Run async scan
        results = asyncio.run(scanner.scan(DEFAULT_PORTS))

        open_ports = []
        for r in results:
            if r.state == PortState.OPEN:
                open_ports.append({
                    "port": r.port,
                    "service": r.service,
                    "state": r.state.value,
                    "latency_ms": r.latency_ms,
                    "banner": r.banner
                })

        report = {
            "status": "success",
            "target": target_clean,
            "resolved_ip": resolved_ip,
            "scanned_ports_count": len(DEFAULT_PORTS),
            "open_ports_count": len(open_ports),
            "open_services": open_ports,
            "risk_level": "CRITICAL" if any(p["port"] in [23, 445, 3389] for p in open_ports) else "ELEVATED" if len(open_ports) > 3 else "NORMAL"
        }

        return jsonify({
            "status": "success",
            "report": report
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    print("🔌 Sentinel TCP Port Scanner is live on port 5003...")
    app.run(host='0.0.0.0', port=5003)
