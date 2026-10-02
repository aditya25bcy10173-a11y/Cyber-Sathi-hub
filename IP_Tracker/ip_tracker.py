#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║           🌐  IP TRACKER v1.0  🌐                    ║
║     Track & geolocate any IP address                 ║
╚══════════════════════════════════════════════════════╝
"""

import json
import sys
import socket
import os
import urllib.request
import urllib.error

# Fix Windows console encoding
if sys.platform == "win32":
    os.system("")  # Enable ANSI escape codes on Windows
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── Banner ───────────────────────────────────────────
BANNER = r"""
  ___ ____    _____               _             
 |_ _|  _ \  |_   _| __ __ _  ___| | _____ _ __ 
  | || |_) |   | || '__/ _` |/ __| |/ / _ \ '__|
  | ||  __/    | || | | (_| | (__|   <  __/ |   
 |___|_|       |_||_|  \__,_|\___|_|\_\___|_|   
                                                  
   ╔══════════════════════════════════╗
   ║   IP Tracker & Locator v1.0     ║
   ╠══════════════════════════════════╣
   ║   Geolocation • ISP • Timezone  ║
   ╚══════════════════════════════════╝
"""

# ─── Colors ───────────────────────────────────────────
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

C = Colors


def resolve_hostname(target: str) -> str:
    """Resolve hostname to IP address if needed."""
    try:
        ip = socket.gethostbyname(target)
        return ip
    except socket.gaierror:
        return target


def get_ip_info(ip: str) -> dict | None:
    """Fetch IP geolocation data from ip-api.com (free, no API key needed)."""
    url = f"http://ip-api.com/json/{ip}?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "IP-Tracker/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data
    except urllib.error.URLError as e:
        print(f"\n  {C.RED}[✗] Network Error: {e}{C.RESET}")
        return None
    except json.JSONDecodeError:
        print(f"\n  {C.RED}[✗] Invalid response from API{C.RESET}")
        return None


def get_my_ip() -> str | None:
    """Get the current public IP of this machine."""
    try:
        req = urllib.request.Request(
            "https://api.ipify.org?format=json",
            headers={"User-Agent": "IP-Tracker/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("ip")
    except Exception:
        return None


def print_ip_info(data: dict) -> None:
    """Pretty-print IP geolocation results."""
    if data.get("status") == "fail":
        print(f"\n  {C.RED}[✗] Lookup failed: {data.get('message', 'Unknown error')}{C.RESET}")
        return

    ip = data.get("query", "N/A")
    
    print(f"\n{C.CYAN}{'═' * 60}{C.RESET}")
    print(f"{C.BOLD}{C.GREEN}  ✓ IP INFORMATION FOUND{C.RESET}")
    print(f"{C.CYAN}{'═' * 60}{C.RESET}\n")

    # ── Main Info ──
    info_sections = [
        ("🌐 IP ADDRESS", [
            ("IP Address",    ip),
        ]),
        ("📍 LOCATION", [
            ("Continent",     data.get("continent", "N/A")),
            ("Country",       f"{data.get('country', 'N/A')} ({data.get('countryCode', '')})"),
            ("Region",        f"{data.get('regionName', 'N/A')} ({data.get('region', '')})"),
            ("City",          data.get("city", "N/A")),
            ("ZIP Code",      data.get("zip", "N/A")),
            ("Latitude",      str(data.get("lat", "N/A"))),
            ("Longitude",     str(data.get("lon", "N/A"))),
            ("Timezone",      data.get("timezone", "N/A")),
        ]),
        ("🏢 NETWORK", [
            ("ISP",           data.get("isp", "N/A")),
            ("Organization",  data.get("org", "N/A")),
            ("AS Number",     data.get("as", "N/A")),
            ("AS Name",       data.get("asname", "N/A")),
        ]),
        ("🔒 SECURITY FLAGS", [
            ("Mobile/Cellular", "✓ Yes" if data.get("mobile") else "✗ No"),
            ("Proxy/VPN",       "⚠ Yes" if data.get("proxy") else "✗ No"),
            ("Hosting/DC",      "✓ Yes" if data.get("hosting") else "✗ No"),
        ]),
    ]

    for section_title, fields in info_sections:
        print(f"  {C.BOLD}{C.YELLOW}{section_title}{C.RESET}")
        print(f"  {C.DIM}{'─' * 45}{C.RESET}")
        for label, value in fields:
            print(f"  {C.CYAN}{label:18}{C.RESET} │ {C.WHITE}{value}{C.RESET}")
        print()

    # ── Google Maps Link ──
    lat = data.get("lat")
    lon = data.get("lon")
    if lat and lon:
        maps_url = f"https://www.google.com/maps?q={lat},{lon}"
        print(f"  {C.BOLD}{C.GREEN}📌 Google Maps:{C.RESET} {C.BLUE}{maps_url}{C.RESET}")

    print(f"\n{C.CYAN}{'═' * 60}{C.RESET}")


def interactive_mode():
    """Run IP Tracker in interactive mode."""
    print(f"{C.GREEN}{BANNER}{C.RESET}")

    # Show user's own IP
    my_ip = get_my_ip()
    if my_ip:
        print(f"  {C.YELLOW}Your Public IP: {C.WHITE}{my_ip}{C.RESET}")
    print(f"  {C.YELLOW}Type an IP/hostname to track, 'me' for your IP, or 'quit' to exit.{C.RESET}\n")

    while True:
        try:
            target = input(f"{C.BOLD}{C.BLUE}  ┌──({C.GREEN}IP-Tracker{C.BLUE})──[{C.WHITE}~{C.BLUE}]\n  └──▶ {C.RESET}").strip()

            if not target:
                continue
            if target.lower() in ("quit", "exit", "q"):
                print(f"\n  {C.YELLOW}[!] Goodbye! Stay safe. 🌐{C.RESET}\n")
                break

            # Handle 'me' shortcut
            if target.lower() == "me":
                target = my_ip or "127.0.0.1"
                print(f"  {C.CYAN}[*] Tracking your IP: {target}{C.RESET}")

            # Resolve hostname if needed
            original = target
            ip = resolve_hostname(target)
            if ip != original:
                print(f"  {C.CYAN}[*] Resolved {original} → {ip}{C.RESET}")

            print(f"  {C.YELLOW}[*] Fetching info for {ip}...{C.RESET}")

            data = get_ip_info(ip)
            if data:
                print_ip_info(data)

        except KeyboardInterrupt:
            print(f"\n\n  {C.YELLOW}[!] Interrupted. Goodbye!{C.RESET}\n")
            break


def main():
    """Entry point — supports CLI argument or interactive mode."""
    if len(sys.argv) > 1:
        target = sys.argv[1]

        if target.lower() == "me":
            target = get_my_ip() or "127.0.0.1"
            print(f"  {C.CYAN}[*] Your public IP: {target}{C.RESET}")

        original = target
        ip = resolve_hostname(target)
        if ip != original:
            print(f"  {C.CYAN}[*] Resolved {original} → {ip}{C.RESET}")

        data = get_ip_info(ip)
        if data:
            print_ip_info(data)
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
