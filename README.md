# 🛡️ CYBER SAATHI HUB - Integrated Security & Telemetry Platform

Cyber Saathi Hub (Project Sentinel) is a modular, high-performance cybersecurity telemetry dashboard that unites AI/ML heuristic analysis, cryptographic verification, and network intelligence tools into a unified Next.js + Python microservices ecosystem.

---

## 🏛️ System Architecture

```text
                     ┌────────────────────────────────────────┐
                     │   Next.js 16 Web Dashboard (Port 3000) │
                     │   - Tailwind CSS v4 Cyber-Matrix UI    │
                     │   - Bilingual (English & Hindi) Support│
                     └───────────────────┬────────────────────┘
                                         │ Next.js Server Actions
                     ┌───────────────────┴────────────────────┐
                     ▼                                        ▼
 ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
 │       Forensics & Cryptography       │  │        Network & Heuristic AI        │
 ├──────────────────────────────────────┤  ├──────────────────────────────────────┤
 │ Port 5000: Password Entropy Engine   │  │ Port 5001: URL Phishing Detector     │
 │ Port 5002: Hash Identifier v1.0      │  │ Port 5003: Asynchronous Port Scanner │
 │ Port 5006: SSL/TLS Cert Inspector    │  │ Port 5004: File Malware Drop-Zone    │
 │                                      │  │ Port 5005: IP Geolocation & BGP Trace│
 │                                      │  │ Port 5007: SMS & Smishing Detector   │
 │                                      │  │ Port 5008: Mal-Email NLP Detector    │
 └──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 📁 Integrated Repository Layout

```plaintext
CYBER_SATHI_HUB/
├── app/                           # Next.js App Router
│   ├── globals.css                # Red-Team Cyber-Aesthetic Design Layout
│   ├── layout.tsx                 # Core Viewport Global Context Providers
│   ├── page.tsx                   # Master Telemetry Control Grid
│   ├── login/                     # Terminal Access Portal
│   └── tools/                     # Modular Security Tool Interfaces
│       ├── email/                 # NLP Phishing Interface
│       ├── hash/                  # Cryptographic Lookup Interface
│       ├── ip/                    # IP Geolocation & BGP Routing Telemetry
│       ├── malware/               # Malware Drop-Zone Sandbox
│       ├── password/              # Password Entropy Visualizer
│       ├── port/                  # Network Service Mapping Grid
│       ├── sms/                   # SMS & Smishing Threat Detector
│       ├── ssl/                   # X.509 Cryptographic Cert Inspector
│       └── url/                   # Heuristic & ML URL Scanner
├── src/
│   ├── actions/                   # Decoupled Secure Next.js Server Actions (Fetch Tunnels)
│   │   ├── email.ts
│   │   ├── hash.ts
│   │   ├── ip.ts
│   │   ├── malware.ts
│   │   ├── password.ts
│   │   ├── port.ts
│   │   ├── sms.ts
│   │   ├── ssl.ts
│   │   └── url.ts
│   └── utils/
│       └── supabase.ts            # Supabase Cloud Client Config
├── Email_detector/                # Keras & TF-IDF Email Threat Analyzer (Port 5008)
├── Hash_Identifier/               # 20+ Hash Identification Engine (Port 5002)
├── IP_Tracker/                    # Geolocation, ISP & BGP IP Intelligence (Port 5005)
├── SMS Detector/                  # ML SMS & Smishing Classifier (Port 5007)
├── URL_detector/                  # Random Forest & Heuristic URL Classifier (Port 5001)
├── port_scanner/                  # High-Performance Async TCP Port Scanner (Port 5003)
├── engines/                       # Supporting Microservices (Password, SSL, Malware)
├── start_all_engines.py           # Master Multi-Engine Orchestrator Launcher
├── requirements.txt               # Python Dependencies
├── package.json                   # Consolidated Node Dependencies & Run Scripts
└── .env.example                   # Sample Environment Variables
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.9+

### 2. Install Dependencies

```bash
# Install frontend packages
npm install

# Install Python microservice requirements
pip install -r requirements.txt
```

### 3. Run the Platform

You can run the entire platform (Frontend + All Python Microservices) with a single command:

```bash
npm run dev
```

Or run them individually:

```bash
# Terminal 1: Launch Next.js Frontend (Port 3000)
npm run dev:ui

# Terminal 2: Launch All Python Telemetry Engines (Ports 5000-5008)
npm run dev:engines
```

Open [http://localhost:3000](http://localhost:3000) to view the Cyber Saathi Hub dashboard.
