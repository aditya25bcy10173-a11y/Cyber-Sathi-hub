import hashlib
import requests
import os

print("🦠 Booting up Sentinel Phase 6: File Malware Scanner...")

# Paste your free VirusTotal API key here
VT_API_KEY = "44e4fd429bceb45c13b8a8f4f244fd0a025766181d0ff15dc688a31e6e0026a4"

def get_file_hash(filepath):
    """Calculates the SHA-256 hash of a file locally to save bandwidth."""
    sha256_hash = hashlib.sha256()
    try:
        # Read the file in chunks so we don't crash if it's a massive file
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except FileNotFoundError:
        return None

def scan_file_hash(file_hash):
    """Queries VirusTotal to see if this exact file fingerprint has been flagged by Antivirus engines."""
    if VT_API_KEY == "YOUR_API_KEY_HERE":
        return {"error": "Missing VirusTotal API Key. Please add it to scanner.py"}

    print(f"🌐 Querying global Threat Intel for hash: {file_hash}...")
    url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
    
    headers = {
        "accept": "application/json",
        "x-apikey": VT_API_KEY
    }

    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            # Parse the massive JSON response down to what we care about
            stats = response.json()['data']['attributes']['last_analysis_stats']
            
            risk_level = "LOW"
            if stats['malicious'] > 5:
                risk_level = "CRITICAL (Confirmed Malware)"
            elif stats['malicious'] > 0 or stats['suspicious'] > 0:
                risk_level = "MEDIUM (Suspicious Indicators)"

            return {
                "status": "Found in Database",
                "malicious_flags": stats['malicious'],
                "suspicious_flags": stats['suspicious'],
                "clean_flags": stats['undetected'],
                "risk_assessment": risk_level
            }
            
        elif response.status_code == 404:
            return {
                "status": "Unknown File", 
                "message": "This file hash has never been seen by VirusTotal. It might be safe, or it might be a brand new Zero-Day threat.",
                "risk_assessment": "UNKNOWN"
            }
        elif response.status_code == 401:
            return {"error": "Invalid API Key. Check your credentials."}
        elif response.status_code == 429:
            return {"error": "Rate Limit Exceeded. VirusTotal free tier allows 4 requests per minute."}
        else:
            return {"error": f"API Error {response.status_code}"}
            
    except Exception as e:
         return {"error": str(e)}

def analyze_file(filepath):
    """The master function that hashes the file and checks it."""
    if not os.path.exists(filepath):
        return {"error": "File not found."}
        
    print(f"\n⚙️ Hashing local file: {filepath}")
    file_hash = get_file_hash(filepath)
    
    if not file_hash:
        return {"error": "Failed to generate file hash."}
        
    report = scan_file_hash(file_hash)
    report["file_hash"] = file_hash
    return report

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🛡️ Sentinel Local File Scanner Test")
    print("="*50)
    
    # We will test it on its own script file!
    test_file = "scanner.py"
    
    result = analyze_file(test_file)
    print("\n📊 --- THREAT REPORT ---")
    for key, value in result.items():
        print(f"{key.capitalize():<18}: {value}")