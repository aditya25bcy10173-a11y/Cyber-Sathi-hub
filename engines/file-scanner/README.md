# 🦠 Sentinel Phase 6: Zero-Trust File Malware Scanner

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-lightgrey.svg)](https://flask.palletsprojects.com/)
[![Security](https://img.shields.io/badge/Security-Endpoint_Scanning-red.svg)]()

## 🌌 The Sentinel Series (Phase 6)
This project is the **sixth module** of the **Sentinel Cyber AI** architecture. Moving into Endpoint Security, this microservice acts as an automated File Analysis engine powered by global Threat Intelligence.

1. ✅ Password Strength & Security Logic 
2. ✅ Suspicious URL Detector (Machine Learning)
3. ✅ Phishing Email Analyzer (NLP/Zero-Shot)
4. ✅ Forensic Hash Identifier & Cracking Engine
5. ✅ Deep Port Scanner & Recon Engine
6. 👉 **Zero-Trust File Malware Scanner** (Current)

---

## 📝 Project Overview
A highly secure, bandwidth-efficient file scanning API. Instead of uploading massive user files directly to the internet (which risks data exposure and burns API limits), this engine uses **In-Memory Cryptographic Hashing**. It reads the uploaded file directly in RAM, calculates its SHA-256 fingerprint, and only sends the mathematical hash to the VirusTotal global database to check for malware flags.

### 🛡️ Core Features
* **In-Memory Processing:** Uploaded files are never saved to the local server disk, preventing accidental execution of malicious payloads and ensuring zero-trust security.
* **Cryptographic Fingerprinting:** Utilizes Python's `hashlib` to generate SHA-256 hashes locally.
* **Global Threat Intel Integration:** Seamlessly queries the VirusTotal v3 API to check the generated hash against dozens of industry-leading Antivirus engines.
* **Bandwidth Optimization:** By sending a 64-character hash instead of a 500MB file, the API responds in milliseconds.
* **REST API Encapsulation:** Wrapped in a Flask endpoint on Port 5004.

---

## 🚀 Getting Started

### Installation
```bash
git clone [https://github.com/YOUR_USERNAME/sentinel-file-scanner.git](https://github.com/YOUR_USERNAME/sentinel-file-scanner.git)
cd sentinel-file-scanner
pip install Flask requests