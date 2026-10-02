# 🔐 Hash Identifier

A Python-based tool to identify the type of a cryptographic hash from an unknown hash string.

## 📌 Features
- Identifies **28+ hash algorithms** including MD5, SHA-1, SHA-256, SHA-512, bcrypt, NTLM, MySQL, CRC-32, and more
- Ranks results by **most likely** algorithm
- Supports **interactive mode** (REPL) and **CLI mode**
- **Zero external dependencies** — uses only Python standard library
- Colorful terminal output with ANSI codes (Windows compatible)

## 🚀 Usage

### Interactive Mode
```
python hash_identifier.py
```

### CLI Mode (single hash)
```
python hash_identifier.py <hash_value>
```

### Example
```
python hash_identifier.py 5d41402abc4b2a76b9719d911017c592
```

**Output:**
```
Input Hash: 5d41402abc4b2a76b9719d911017c592
Length    : 32 characters

✓ 8 possible match(es) found:

[1] MD5  ← Most Likely
    Description: Message Digest 5 (most common)
    Hash Length: 32 chars
```

## 🧠 How It Works

Uses **Regular Expression (regex) pattern matching** against 28 known hash patterns.
Each hash string is matched against all patterns. Results are ranked with the most common algorithms first.

## 📋 Supported Hash Types

| Category | Algorithms |
|----------|-----------|
| MD Series | MD2, MD4, MD5 |
| SHA-1 Family | SHA-1, RIPEMD-160 |
| SHA-2 Family | SHA-224, SHA-256, SHA-384, SHA-512 |
| SHA-3 (Keccak) | SHA3-224, SHA3-256, SHA3-384, SHA3-512 |
| Windows | NTLM, LM Hash |
| Unix Crypt | MD5-Crypt, SHA-256-Crypt, SHA-512-Crypt |
| Database | MySQL 3.x, MySQL 4.x/5.x |
| Network | Cisco IOS MD5, Cisco Type 7 |
| Checksum | CRC-16, CRC-32, Adler-32 |
| Modern | bcrypt, Whirlpool |
| HMAC | HMAC-MD5, HMAC-SHA1, HMAC-SHA256 |
| Encoding | Base64 |

## 📦 Requirements
- Python 3.x
- No external packages needed

## 👤 Author
Developed for **CYBER SATHI HUB** — Project Exhibition, VIT Bhopal
