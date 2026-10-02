# Project Sentinel: Multi-Engine Security Telemetry & Orchestration Dashboard

Project Sentinel is a modular, high-performance cybersecurity telemetry dashboard built to centralize diverse cryptographic, network, and heuristic security tools into a single, unified interface. 

The architecture implements a **monorepo system using Git Submodules** to decouple the user interface from individual backend analysis microservices. This separation ensures that each utility remains light, isolated, and scalable, operating independently across dedicated network ports.

---

## 🏗️ Architectural Overview: Why & How

### 1. Why a Distributed Microservices Architecture?
Traditional monolithic security tools face tight dependency coupling. For instance, running a heavy **Transformer-based Natural Language Processing (NLP)** model for email phishing classification inside the same environment as a **low-latency TCP port scanner** introduces severe resource contention and dependency conflicts (e.g., Python AI libraries vs. Node.js system sockets).

**The Solution:**
Sentinel isolates every analysis utility into its own specialized Python Flask engine. 
* **UI Layer:** Next.js (React) serves as a unified command center.
* **Proxy Layer:** Next.js Server Actions establish point-to-point secure internal fetches to local loopback ports.
* **Data Layer:** Supabase handles centralized authorization and PostgreSQL telemetry storage with Row-Level Security (RLS).

```text
                     [ Next.js User Interface ]
                                 │
                     [ Next.js Server Actions ]
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   (Port 5000)             (Port 5001)             (Port 5008)
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Password Engine │     │   URL Engine    │     │  Email Engine   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                 ▲                       │
                                 └───────[Cross-API]─────┘


Cross-Service Network Orchestration
By exposing individual utility ports, services can safely interconnect. For example, when an operator inputs a raw payload into the Mal-Email NLP Orchestrator (Port 5008), the email engine automatically extracts Indicators of Compromise (IOCs). If it discovers embedded links, it generates a downstream cross-API POST request to the URL Threat Scanner (Port 5001) to complete a multi-layered verification chain before returning a master score to the UI.

>>>Monorepo Directory Layout
Plaintext
sentinel-dashboard/
├── app/                           # Next.js App Router (Root Filesystem Routing)
│   ├── globals.css                # Red-Team Matrix Cyber-Aesthetic Design Layout
│   ├── layout.tsx                 # Core Viewport Global Context Providers
│   ├── page.tsx                   # Master Telemetry Control Grid
│   ├── login/                     # Restricted Access Authentication Portal
│   └── tools/                     # Modular Tool-Glass UI Interfaces
│       ├── email/                 # NLP Phishing Interface
│       ├── file-scanner/          # Malware Drop-Zone Sandbox
│       ├── hash/                  # Cryptographic Lookup Interface
│       ├── ip-checker/            # Packet Routing Telemetry View
│       ├── password/              # Entropy Breakdown Visualizer
│       ├── port-scanner/          # Network Service Mapping Grid
│       └── ssl-checker/           # X.509 Cryptographic Cert Inspector
├── src/
│   ├── actions/                   # Decoupled Secure Next.js Server Actions (Fetch Tunnels)
│   │   ├── email.ts
│   │   ├── file.ts
│   │   └── [...]
│   └── utils/
│       └── supabase.ts            # Supabase Cloud Client Core Config
├── engines/                       # Decoupled Python Telemetry Engines (Git Submodules)
│   ├── sentinel-hash-identifier/  # Port 5002 - Dictionary Attack Analyzer
│   ├── url-detector/              # Port 5001 - Heuristic Domain Lookup
│   ├── email-reader/              # Port 5008 - DistilBERT Threat Classifier
│   ├── password-analyzer/         # Port 5000 - Shannon Entropy Core
│   ├── ip-checker/                # Port 5005 - GeoIP Telemetry
│   ├── ssl-checker/               # Port 5006 - TLS ClientHello Parser
│   ├── port-scanner/              # Port 5003 - TCP SYN Probe Engine
│   └── file-scanner/              # Port 5004 - YARA Malware Sandbox
├── .gitmodules                    # Submodule Pointer Configuration Map
├── package.json                   # Consolidated Node Dependencies & Run Scripts
└── .env.local                     # Restrictive Cloud Tokens (Never Committed)


