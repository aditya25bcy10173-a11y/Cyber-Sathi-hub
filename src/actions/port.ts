"use server"

import net from 'net';
import dns from 'dns/promises';

const COMMON_PORT_MAP: Record<number, string> = {
  21: "FTP (File Transfer)",
  22: "SSH (Secure Shell)",
  23: "Telnet (Unencrypted CLI)",
  25: "SMTP (Mail Routing)",
  53: "DNS (Domain Name Service)",
  80: "HTTP (Web Service)",
  110: "POP3 (Mail Access)",
  139: "NetBIOS (Windows File Sharing)",
  143: "IMAP (Mail Access)",
  443: "HTTPS (Secure Web)",
  445: "SMB (Direct Host Sharing)",
  1433: "MS-SQL (Database)",
  3306: "MySQL (Database)",
  3389: "RDP (Remote Desktop)",
  5432: "PostgreSQL (Database)",
  6379: "Redis (Cache / Store)",
  8080: "HTTP-Alt / Proxy",
  8443: "HTTPS-Alt"
};

const DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 1433, 3306, 3389, 5432, 6379, 8080, 8443];

function checkPort(host: string, port: number, timeoutMs = 1200): Promise<{ port: number; service: string; state: string; latency_ms: number; banner: string } | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      const latency = Date.now() - start;
      const serviceName = COMMON_PORT_MAP[port] || `Service-${port}`;
      socket.destroy();
      resolve({
        port,
        service: serviceName,
        state: "open",
        latency_ms: latency,
        banner: `${serviceName} service active`
      });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(null);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

export interface PortAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzePorts(targetHost: string): Promise<PortAnalysisResponse> {
  try {
    const rawTarget = (targetHost || '').trim();
    if (!rawTarget) {
      return { status: "error", error: "No target host specified." };
    }

    const cleanHost = rawTarget
      .replace(/^https?:\/\//i, "")
      .split('/')[0]
      .split(':')[0];

    let resolvedIp = cleanHost;
    try {
      const lookup = await dns.lookup(cleanHost);
      resolvedIp = lookup.address;
    } catch {
      if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
        return { status: "error", error: `Failed to resolve hostname '${cleanHost}'. Verify domain exists.` };
      }
    }

    const checkPromises = DEFAULT_PORTS.map(port => checkPort(resolvedIp, port));
    const results = await Promise.all(checkPromises);
    const openPorts = results.filter((r): r is NonNullable<typeof r> => r !== null);

    let riskLevel = "NORMAL";
    if (openPorts.some(p => [23, 445, 3389, 21].includes(p.port))) {
      riskLevel = "CRITICAL (Sensitive management ports open to public)";
    } else if (openPorts.length > 3) {
      riskLevel = "ELEVATED";
    }

    const report = {
      status: "success",
      target: cleanHost,
      resolved_ip: resolvedIp,
      scanned_ports_count: DEFAULT_PORTS.length,
      open_ports_count: openPorts.length,
      open_services: openPorts,
      risk_level: riskLevel
    };

    return {
      status: "success",
      report: report,
      data: report
    };
  } catch (error: any) {
    console.error("Port Scan Error:", error);
    return { status: "error", error: error?.message || "Port Scan Failed." };
  }
}