# 🌐 IP Tracker

A Python-based tool to geolocate and track any IP address or hostname — shows country, city, ISP, timezone, VPN detection, and a Google Maps link.

## 📌 Features
- Tracks **any public IPv4/IPv6 address** or **hostname** (auto DNS resolution)
- Shows **20+ data fields**: Country, Region, City, ISP, ASN, Timezone, Coordinates
- Detects **VPN / Proxy / Hosting** servers
- Generates a **Google Maps link** from coordinates
- Shortcut **'me'** to track your own public IP
- **Zero external dependencies** — uses only Python standard library
- Supports **interactive mode** and **CLI mode**

## 🚀 Usage

### Interactive Mode
```
python ip_tracker.py
```

### CLI Mode (single IP/hostname)
```
python ip_tracker.py <ip_or_hostname>
```

### Examples
```bash
python ip_tracker.py 8.8.8.8          # Track Google DNS
python ip_tracker.py google.com       # Track by hostname
python ip_tracker.py me               # Track your own IP
```

**Output:**
```
✓ IP INFORMATION FOUND

🌐 IP ADDRESS
  IP Address         │ 8.8.8.8

📍 LOCATION
  Continent          │ North America
  Country            │ United States (US)
  City               │ Ashburn
  Timezone           │ America/New_York

🏢 NETWORK
  ISP                │ Google LLC
  AS Number          │ AS15169 Google LLC

🔒 SECURITY FLAGS
  Proxy/VPN          │ ⚠ Yes
  Hosting/DC         │ ✓ Yes

📌 Google Maps: https://www.google.com/maps?q=39.03,-77.5
```

## 🧠 How It Works

1. **DNS Resolution** — socket.gethostbyname() converts hostnames to IPs
2. **API Call** — Sends HTTP GET to http://ip-api.com/json/{ip} (free, no API key needed)
3. **Parse JSON** — 20+ fields extracted from response
4. **Display** — Formatted output with Google Maps link

### API Used
| API | Purpose | Auth |
|-----|---------|------|
| [ip-api.com](http://ip-api.com) | Geolocation (45 req/min free) | No key needed |
| [ipify.org](https://api.ipify.org) | Get own public IP | No key needed |

ip-api.com is a **public REST API** that uses IP-based rate limiting instead of API key authentication, making it free to use for educational/non-commercial purposes.

## 📋 Data Returned

| Field | Example |
|-------|---------|
| Country | India (IN) |
| Region | Madhya Pradesh |
| City | Bhopal |
| ZIP | 462001 |
| Latitude / Longitude | 23.26, 77.41 |
| Timezone | Asia/Kolkata |
| ISP | Reliance Jio |
| ASN | AS55836 |
| Mobile | Yes / No |
| Proxy/VPN | Yes / No |
| Hosting/DC | Yes / No |

## 📦 Requirements
- Python 3.x
- Internet connection (for API call)
- No external packages needed

## 👤 Author
Developed for **CYBER SATHI HUB** — Project Exhibition, VIT Bhopal
