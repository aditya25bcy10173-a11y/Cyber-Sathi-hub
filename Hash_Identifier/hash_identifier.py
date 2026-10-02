#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║           🔐  HASH IDENTIFIER v1.0  🔐              ║
║     Identify hash types from any unknown hash        ║
╚══════════════════════════════════════════════════════╝
"""

import re
import sys
import os

# Fix Windows console encoding
if sys.platform == "win32":
    os.system("")  # Enable ANSI escape codes on Windows
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── Banner ───────────────────────────────────────────
BANNER = r"""
  _   _           _       ___ ____  
 | | | | __ _ ___| |__   |_ _|  _ \ 
 | |_| |/ _` / __| '_ \   | || | | |
 |  _  | (_| \__ \ | | |  | || |_| |
 |_| |_|\__,_|___/_| |_| |___|____/ 
                                      
   ╔════════════════════════════════╗
   ║   Hash Identifier Tool v1.0   ║
   ╠════════════════════════════════╣
   ║  Supports 20+ hash algorithms ║
   ╚════════════════════════════════╝
"""

# ─── Color codes ──────────────────────────────────────
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

C = Colors

# ─── Hash Definitions ────────────────────────────────
# Each entry: (name, regex_pattern, description)
HASH_DB = [
    # ── CRC ──
    ("CRC-16",          r"^[a-fA-F0-9]{4}$",         "Cyclic Redundancy Check 16-bit"),
    ("CRC-32",          r"^[a-fA-F0-9]{8}$",         "Cyclic Redundancy Check 32-bit"),

    # ── MD Series ──
    ("MD2",             r"^[a-fA-F0-9]{32}$",        "Message Digest 2"),
    ("MD4",             r"^[a-fA-F0-9]{32}$",        "Message Digest 4"),
    ("MD5",             r"^[a-fA-F0-9]{32}$",        "Message Digest 5 (most common)"),
    ("NTLM",            r"^[a-fA-F0-9]{32}$",        "NT LAN Manager Hash"),

    # ── SHA-1 ──
    ("SHA-1",           r"^[a-fA-F0-9]{40}$",        "Secure Hash Algorithm 1"),
    ("RIPEMD-160",      r"^[a-fA-F0-9]{40}$",        "RACE Integrity Primitives 160-bit"),

    # ── MySQL ──
    ("MySQL 3.x",       r"^[a-fA-F0-9]{16}$",        "MySQL v3.x Password Hash"),
    ("MySQL 4.x/5.x",   r"^\*[a-fA-F0-9]{40}$",      "MySQL v4.x/5.x Password Hash"),

    # ── SHA-2 Family ──
    ("SHA-224",         r"^[a-fA-F0-9]{56}$",        "Secure Hash Algorithm 224-bit"),
    ("SHA-256",         r"^[a-fA-F0-9]{64}$",        "Secure Hash Algorithm 256-bit"),
    ("SHA-384",         r"^[a-fA-F0-9]{96}$",        "Secure Hash Algorithm 384-bit"),
    ("SHA-512",         r"^[a-fA-F0-9]{128}$",       "Secure Hash Algorithm 512-bit"),

    # ── SHA-3 Family ──
    ("SHA3-224",        r"^[a-fA-F0-9]{56}$",        "SHA-3 224-bit (Keccak)"),
    ("SHA3-256",        r"^[a-fA-F0-9]{64}$",        "SHA-3 256-bit (Keccak)"),
    ("SHA3-384",        r"^[a-fA-F0-9]{96}$",        "SHA-3 384-bit (Keccak)"),
    ("SHA3-512",        r"^[a-fA-F0-9]{128}$",       "SHA-3 512-bit (Keccak)"),

    # ── Whirlpool ──
    ("Whirlpool",       r"^[a-fA-F0-9]{128}$",       "Whirlpool Hash 512-bit"),

    # ── bcrypt ──
    ("bcrypt",          r"^\$2[aby]?\$\d{2}\$.{53}$", "bcrypt Blowfish Hash"),

    # ── Unix Crypt Hashes ──
    ("MD5 (Unix)",      r"^\$1\$.{8}\$.{22}$",        "Unix MD5 Crypt"),
    ("SHA-256 (Unix)",  r"^\$5\$.{8,16}\$.{43}$",     "Unix SHA-256 Crypt"),
    ("SHA-512 (Unix)",  r"^\$6\$.{8,16}\$.{86}$",     "Unix SHA-512 Crypt"),

    # ── Cisco ──
    ("Cisco IOS (MD5)", r"^\$1\$.{8}\$.{22}$",        "Cisco IOS MD5 Hash"),
    ("Cisco Type 7",    r"^[a-fA-F0-9]{4,}$",        "Cisco Type 7 (weak encoding)"),

    # ── LM Hash ──
    ("LM Hash",        r"^[a-fA-F0-9]{32}$",         "LAN Manager Hash (legacy Windows)"),

    # ── Adler-32 ──
    ("Adler-32",        r"^[a-fA-F0-9]{8}$",         "Adler-32 Checksum"),

    # ── HMAC ──
    ("HMAC-MD5",        r"^[a-fA-F0-9]{32}$",        "HMAC using MD5"),
    ("HMAC-SHA1",       r"^[a-fA-F0-9]{40}$",        "HMAC using SHA-1"),
    ("HMAC-SHA256",     r"^[a-fA-F0-9]{64}$",        "HMAC using SHA-256"),

    # ── Base64 encoded ──
    ("Base64 Encoded",  r"^[A-Za-z0-9+/]+=*$",       "Possibly Base64-encoded data"),
]


def identify_hash(hash_str: str) -> list[dict]:
    """Identify possible hash types for a given hash string."""
    hash_str = hash_str.strip()
    results = []

    for name, pattern, desc in HASH_DB:
        if re.match(pattern, hash_str):
            results.append({
                "algorithm": name,
                "description": desc,
                "length": len(hash_str),
            })

    return results


def print_results(hash_str: str, results: list[dict]) -> None:
    """Pretty-print the identification results."""
    print(f"\n{C.CYAN}{'═' * 60}{C.RESET}")
    print(f"{C.BOLD}{C.YELLOW}  Input Hash:{C.RESET} {C.WHITE}{hash_str}{C.RESET}")
    print(f"{C.BOLD}{C.YELLOW}  Length    :{C.RESET} {C.WHITE}{len(hash_str)} characters{C.RESET}")
    print(f"{C.CYAN}{'═' * 60}{C.RESET}")

    if not results:
        print(f"\n  {C.RED}✗ No matching hash type found!{C.RESET}")
        print(f"  {C.YELLOW}Tip: Check if the hash is complete and valid.{C.RESET}\n")
        return

    print(f"\n  {C.GREEN}✓ {len(results)} possible match(es) found:{C.RESET}\n")

    # Prioritize most-likely matches
    priority_order = [
        "MD5", "SHA-1", "SHA-256", "SHA-512", "SHA-224", "SHA-384",
        "bcrypt", "NTLM", "MySQL 4.x/5.x", "SHA3-256", "SHA3-512",
    ]
    
    def sort_key(item):
        name = item["algorithm"]
        if name in priority_order:
            return (0, priority_order.index(name))
        return (1, name)

    results.sort(key=sort_key)

    for i, r in enumerate(results, 1):
        most_likely = ""
        if i == 1 and len(results) > 1:
            most_likely = f" {C.GREEN}← Most Likely{C.RESET}"

        print(f"  {C.BOLD}{C.MAGENTA}[{i}]{C.RESET} {C.BOLD}{C.WHITE}{r['algorithm']}{C.RESET}{most_likely}")
        print(f"      {C.CYAN}Description:{C.RESET} {r['description']}")
        print(f"      {C.CYAN}Hash Length:{C.RESET} {r['length']} chars")
        print()

    print(f"{C.CYAN}{'═' * 60}{C.RESET}")


def interactive_mode():
    """Run the hash identifier in interactive loop mode."""
    print(f"{C.GREEN}{BANNER}{C.RESET}")
    print(f"  {C.YELLOW}Type a hash to identify, or 'quit' to exit.{C.RESET}\n")

    while True:
        try:
            hash_input = input(f"{C.BOLD}{C.BLUE}  ┌──({C.GREEN}HashID{C.BLUE})──[{C.WHITE}~{C.BLUE}]\n  └──▶ {C.RESET}").strip()

            if not hash_input:
                continue
            if hash_input.lower() in ("quit", "exit", "q"):
                print(f"\n  {C.YELLOW}[!] Goodbye! Stay safe. 🔒{C.RESET}\n")
                break

            results = identify_hash(hash_input)
            print_results(hash_input, results)

        except KeyboardInterrupt:
            print(f"\n\n  {C.YELLOW}[!] Interrupted. Goodbye!{C.RESET}\n")
            break


def main():
    """Entry point — supports CLI argument or interactive mode."""
    if len(sys.argv) > 1:
        # CLI mode: python hash_identifier.py <hash>
        hash_input = sys.argv[1]
        results = identify_hash(hash_input)
        print_results(hash_input, results)
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
