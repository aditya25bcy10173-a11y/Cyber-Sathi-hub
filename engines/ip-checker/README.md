# 🛡️ Sentinel OS - Phase 7: IP Reputation Engine

**A high-performance Security Operations Center (SOC) microservice for real-time IP geolocation and threat intelligence.**

![UI Preview](https://img.shields.io/badge/UI-Dark_Mode_Glassmorphism-00f0ff?style=for-the-badge)
![Python Backend](https://img.shields.io/badge/Backend-Flask_API-3b82f6?style=for-the-badge)

## 📌 Overview
The IP Reputation Engine is an isolated microservice module belonging to the broader Sentinel OS architecture. It allows analysts to input any public IPv4 address to instantly bypass local proxies, map the target's physical server location, and query global cybersecurity databases for behavioral threat intelligence.

## ⚙️ Architecture & Tech Stack
This module utilizes a decoupled frontend/backend microservice architecture:
* **Frontend Interface:** Pure HTML/CSS/JavaScript with dynamic DOM manipulation, glassmorphism UI, and a cinematic boot sequence.
* **Mapping Engine:** Leaflet.js rendering OpenStreetMap tiles with custom CSS filters for a native dark-mode aesthetic.
* **Backend API:** Python/Flask server running on Port 5005.
* **External Integrations:** * `ip-api.com` (ISP routing and coordinate geolocation)
    * `AbuseIPDB` (Crowdsourced malicious behavior tracking and confidence scoring)
* **Secrets Management:** Python `dotenv` for secure API key isolation.

## 🚀 Local Installation & Setup

**1. Clone the repository and navigate to the module directory:**
```bash
git clone [https://github.com/your-username/sentinel-os.git](https://github.com/your-username/sentinel-os.git)
cd sentinel-phase-ip