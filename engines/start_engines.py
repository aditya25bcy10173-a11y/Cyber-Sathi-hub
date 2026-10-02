import subprocess
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ENGINES = [
    ("PASSWORD", "password-analyzer", 5000),
    ("URL", "url-detector", 5001),
    ("HASH", "hash-identifier", 5002),
    ("PORT", "port-scanner", 5003),
    ("FILE", "file-scanner", 5004),
    ("IP", "ip-checker", 5005),
    ("SSL", "ssl-checker", 5006),
    ("EMAIL", "email-reader", 5008),
]

processes = []

def start():
    print("🚀 Starting all 8 Sentinel Backend Telemetry Engines...")
    for name, folder, port in ENGINES:
        engine_dir = os.path.join(BASE_DIR, folder)
        app_file = os.path.join(engine_dir, "app.py")
        if not os.path.exists(app_file):
            print(f"❌ Missing app.py for {name} in {engine_dir}")
            continue
        p = subprocess.Popen([sys.executable, "app.py"], cwd=engine_dir)
        processes.append((name, port, p))
        print(f"  ✅ [{name}] Engine launched on port {port} (PID: {p.pid})")

    print("\n⚡ All Sentinel microservice engines are online!")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all Sentinel engines...")
        for name, port, p in processes:
            p.terminate()
        print("Done.")

if __name__ == "__main__":
    start()
