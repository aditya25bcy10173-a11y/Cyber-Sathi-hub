"""
Port definitions, common service mappings, and preset port lists.
"""

from typing import Dict, List, Set

# Common port to service name mappings
COMMON_SERVICES: Dict[int, str] = {
    7: "Echo",
    20: "FTP-Data",
    21: "FTP-Control",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    67: "DHCP-Server",
    68: "DHCP-Client",
    69: "TFTP",
    80: "HTTP",
    88: "Kerberos",
    110: "POP3",
    119: "NNTP",
    123: "NTP",
    135: "MS-RPC",
    137: "NetBIOS-Name",
    138: "NetBIOS-Datagram",
    139: "NetBIOS-Session",
    143: "IMAP",
    161: "SNMP",
    162: "SNMP-Trap",
    179: "BGP",
    389: "LDAP",
    443: "HTTPS",
    445: "SMB",
    465: "SMTPS",
    500: "ISAKMP/IPSec",
    514: "Syslog",
    515: "LPD",
    587: "SMTP-Submission",
    636: "LDAPS",
    873: "Rsync",
    993: "IMAPS",
    995: "POP3S",
    1080: "SOCKS-Proxy",
    1194: "OpenVPN",
    1433: "MS-SQL",
    1434: "MS-SQL-Monitor",
    1521: "Oracle-DB",
    1723: "PPTP",
    1883: "MQTT",
    2049: "NFS",
    2181: "ZooKeeper",
    2375: "Docker-Plain",
    2376: "Docker-TLS",
    3000: "NodeJS/Grafana/Dev",
    3306: "MySQL",
    3389: "RDP",
    3690: "SVN",
    4369: "Erlang-EPMD",
    5000: "Flask/Docker-Registry",
    5060: "SIP",
    5432: "PostgreSQL",
    5672: "RabbitMQ",
    5900: "VNC",
    5985: "WinRM-HTTP",
    5986: "WinRM-HTTPS",
    6379: "Redis",
    6443: "Kubernetes-API",
    7001: "WebLogic",
    8000: "HTTP-Alt/Dev",
    8008: "HTTP-Alt",
    8080: "HTTP-Proxy/Apache-Tomcat",
    8443: "HTTPS-Alt",
    8888: "Jupyter/HTTP-Alt",
    9000: "SonarQube/PHP-FPM",
    9090: "Prometheus",
    9092: "Kafka",
    9200: "Elasticsearch",
    9300: "Elasticsearch-Cluster",
    11211: "Memcached",
    27017: "MongoDB",
    27018: "MongoDB-Shard",
    50000: "SAP/DB2",
}

# Top 20 most common ports
TOP_20_PORTS: List[int] = [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139,
    143, 443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080,
]

# Top 100 most common ports (derived from Nmap top ports)
TOP_100_PORTS: List[int] = sorted(list(set(TOP_20_PORTS + [
    7, 9, 13, 26, 37, 79, 81, 88, 106, 113, 119, 144, 179, 199, 389, 427, 465,
    513, 514, 515, 543, 544, 548, 554, 587, 631, 646, 873, 990, 1025, 1026, 1027,
    1028, 1029, 1110, 1433, 1720, 1755, 1900, 2000, 2001, 2049, 2121, 2717, 3000,
    3128, 3389, 3986, 4899, 5000, 5009, 5051, 5060, 5101, 5190, 5357, 5432, 5631,
    5666, 5800, 5900, 6000, 6001, 6646, 7070, 8000, 8008, 8009, 8081, 8443, 8888,
    9100, 9999, 10000, 32768, 49152, 49153, 49154,
])))

# Web presets
PRESET_WEB: List[int] = [
    80, 443, 3000, 5000, 8000, 8008, 8080, 8081, 8443, 8888, 9000, 9090
]

# Database presets
PRESET_DATABASE: List[int] = [
    1433, 1521, 3306, 5432, 6379, 9092, 9200, 11211, 27017, 27018
]

PRESETS: Dict[str, List[int]] = {
    "top20": TOP_20_PORTS,
    "top100": TOP_100_PORTS,
    "web": PRESET_WEB,
    "database": PRESET_DATABASE,
}


def get_service_name(port: int) -> str:
    """Return the service name for a given port, or 'Unknown'."""
    return COMMON_SERVICES.get(port, "Unknown")


def parse_ports(port_spec: str) -> List[int]:
    """
    Parse a flexible port specification string into a sorted list of unique port numbers.
    Supported syntax:
      - Single ports: "80"
      - Comma-separated: "80,443,8080"
      - Ranges: "8000-8010"
      - Combinations: "22,80,443,8000-8005,8080"
    """
    ports: Set[int] = set()
    parts = [p.strip() for p in port_spec.split(",") if p.strip()]

    for part in parts:
        if "-" in part:
            bounds = part.split("-")
            if len(bounds) != 2:
                raise ValueError(f"Invalid port range format: '{part}'")
            try:
                start_p, end_p = int(bounds[0].strip()), int(bounds[1].strip())
            except ValueError:
                raise ValueError(f"Port range must contain integers: '{part}'")

            if start_p > end_p:
                start_p, end_p = end_p, start_p
            if start_p < 1 or end_p > 65535:
                raise ValueError(f"Port numbers out of valid range (1-65535): '{part}'")
            ports.update(range(start_p, end_p + 1))
        else:
            try:
                port = int(part)
            except ValueError:
                raise ValueError(f"Invalid port number: '{part}'")
            if port < 1 or port > 65535:
                raise ValueError(f"Port number {port} out of range (1-65535)")
            ports.add(port)

    return sorted(list(ports))
