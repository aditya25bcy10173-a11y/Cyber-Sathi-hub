import subprocess
import sys
import os
import time

# Windows console encoding fix
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ENGINES = [
    ("PASSWORD ANALYZER", os.path.join("engines", "password-analyzer"), 5000),
    ("URL THREAT DETECTOR", "URL_detector", 5001),
    ("HASH IDENTIFIER", "Hash_Identifier", 5002),
    ("PORT SCANNER", "port_scanner", 5003),
    ("FILE MALWARE SANDBOX", os.path.join("engines", "file-scanner"), 5004),
    ("IP TRACKER", "IP_Tracker", 5005),
    ("SSL/TLS CHECKER", os.path.join("engines", "ssl-checker"), 5006),
    ("SMS SMISHING DETECTOR", "SMS Detector", 5007),
    ("EMAIL THREAT DETECTOR", "Email_detector", 5008),
]

processes = []

def start():
    print("=" * 65)
    print("CYBER SAATHI HUB - BACKEND TELEMETRY ORCHESTRATION ENGINE")
    print("=" * 65)
    
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    
    for name, folder, port in ENGINES:
        engine_dir = os.path.join(BASE_DIR, folder)
        app_file = os.path.join(engine_dir, "app.py")
        
        if not os.path.exists(app_file):
            print(f"[-] Missing app.py for {name} in {engine_dir}")
            continue
            
        try:
            p = subprocess.Popen([sys.executable, "app.py"], cwd=engine_dir, env=env)
            processes.append((name, port, p))
            print(f"  [+] [{name:24}] live on Port {port} (PID: {p.pid})")
        except Exception as e:
            print(f"  [x] [{name:24}] failed to start: {e}")

    print("\nAll backend microservice engines are online!")
    print("Next.js Dashboard connects on http://localhost:3001")
    print("=" * 65)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down all Cyber Saathi Hub backend engines...")
        for name, port, p in processes:
            p.terminate()
        print("All services stopped.")

if __name__ == "__main__":
    start()
