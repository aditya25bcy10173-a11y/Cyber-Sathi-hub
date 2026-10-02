from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load the hidden .env file
load_dotenv()

app = Flask(__name__)
# This is crucial: It allows your index.html to talk to this Python script
CORS(app) 

# Pull the secret key securely from the environment
ABUSE_IPDB_KEY = os.getenv("ABUSEIPDB_KEY")

@app.route('/api/check-ip', methods=['POST'])
def check_ip():
    data = request.get_json()
    if not data or 'ip' not in data:
        return jsonify({"error": "No IP address provided"}), 400
        
    target_ip = data['ip']
    
    # 1. Get Geolocation & ISP Data (Using ip-api.com - Free, no key needed!)
    geo_data = {}
    try:
        geo_resp = requests.get(f"http://ip-api.com/json/{target_ip}").json()
        if geo_resp['status'] == 'success':
            geo_data = {
                "country": geo_resp.get("country"),
                "city": geo_resp.get("city"),
                "isp": geo_resp.get("isp"),
                "lat": geo_resp.get("lat"),
                "lon": geo_resp.get("lon")
            }
    except Exception as e:
        print("Geo API Error:", e)

    # 2. Get Threat Intelligence (Using AbuseIPDB)
    threat_data = {"score": 0, "reports": 0, "status": "Clean"}
    if ABUSE_IPDB_KEY and ABUSE_IPDB_KEY != "your_actual_long_api_key_here":
        try:
            headers = {
                'Accept': 'application/json',
                'Key': ABUSE_IPDB_KEY
            }
            params = {'ipAddress': target_ip, 'maxAgeInDays': 90}
            abuse_resp = requests.get('https://api.abuseipdb.com/api/v2/check', headers=headers, params=params).json()
            
            score = abuse_resp['data']['abuseConfidenceScore']
            threat_data = {
                "score": score,
                "reports": abuse_resp['data']['totalReports'],
                "status": "CRITICAL" if score > 50 else "SUSPICIOUS" if score > 0 else "CLEAN"
            }
        except Exception as e:
             print("Threat API Error:", e)

    # Combine into one master payload
    return jsonify({
        "status": "success",
        "ip": target_ip,
        "geo": geo_data,
        "threat_intel": threat_data
    }), 200

if __name__ == '__main__':
    print("🌍 Sentinel IP Tracker API is live on port 5005...")
    app.run(host='0.0.0.0', port=5005)