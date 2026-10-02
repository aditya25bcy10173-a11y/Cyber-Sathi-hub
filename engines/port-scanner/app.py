import socket
import concurrent.futures
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    139: "NetBIOS",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    1433: "MSSQL",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    6379: "Redis",
    8080: "HTTP-Proxy",
    8443: "HTTPS-Alt"
}

def probe_port(target_ip: str, port: int, timeout: float = 0.5):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            res = s.connect_ex((target_ip, port))
            if res == 0:
                service = COMMON_PORTS.get(port, "Unknown")
                return {"port": port, "service": service, "state": "OPEN"}
    except Exception:
        pass
    return None

@app.route('/api/scan-ports', methods=['POST'])
def scan_ports():
    data = request.get_json() or {}
    target = data.get('target', '').strip()
    # Normalize domain / host
    target_clean = target.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]

    if not target_clean:
        return jsonify({"error": "No target host specified"}), 400

    try:
        resolved_ip = socket.gethostbyname(target_clean)
    except socket.gaierror:
        return jsonify({"error": f"Failed to resolve host: {target_clean}"}), 400

    open_ports = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(probe_port, resolved_ip, port): port for port in COMMON_PORTS.keys()}
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                open_ports.append(res)

    open_ports.sort(key=lambda x: x["port"])

    report = {
        "status": "success",
        "target": target_clean,
        "resolved_ip": resolved_ip,
        "scanned_ports_count": len(COMMON_PORTS),
        "open_ports_count": len(open_ports),
        "open_services": open_ports,
        "risk_level": "ELEVATED" if any(p["port"] in [21, 23, 445, 3389] for p in open_ports) else "NORMAL"
    }

    return jsonify({
        "status": "success",
        "report": report
    }), 200

if __name__ == '__main__':
    print("🔌 Sentinel TCP Port Scanning Engine is live on port 5003...")
    app.run(host='0.0.0.0', port=5003)
