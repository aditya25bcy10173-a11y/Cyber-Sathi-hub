"use server"

import tls from 'tls';

export interface SslAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeSsl(targetDomain: string): Promise<SslAnalysisResponse> {
  try {
    const rawDomain = (targetDomain || '').trim();
    if (!rawDomain) {
      return { status: "error", error: "No domain name provided." };
    }

    const domainClean = rawDomain
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
      .split('/')[0]
      .split(':')[0];

    return new Promise((resolve) => {
      const socket = tls.connect(
        {
          host: domainClean,
          port: 443,
          servername: domainClean,
          rejectUnauthorized: false,
          timeout: 7000
        },
        () => {
          try {
            const cert = socket.getPeerCertificate(true);
            const cipher = socket.getCipher();
            const protocol = socket.getProtocol();

            if (!cert || Object.keys(cert).length === 0) {
              socket.destroy();
              resolve({ status: "error", error: `Could not retrieve SSL certificate for ${domainClean}` });
              return;
            }

            const validFrom = cert.valid_from;
            const validTo = cert.valid_to;
            const validToDate = new Date(validTo);
            const now = new Date();
            const daysRemaining = Math.floor((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isValid = daysRemaining > 0;

            const sans = cert.subjectaltname 
              ? cert.subjectaltname.split(', ').map(s => s.replace('DNS:', ''))
              : [];

            const report = {
              domain: domainClean,
              is_valid: isValid,
              status: isValid ? "VALID" : "EXPIRED",
              subject: cert.subject?.CN || domainClean,
              issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown Issuer",
              valid_from: validFrom,
              valid_to: validTo,
              days_remaining: daysRemaining,
              protocol_version: protocol || "TLSv1.3",
              cipher_suite: cipher?.name || "TLS_AES_256_GCM_SHA384",
              key_strength: `${cipher?.standardName || cipher?.name || '256-bit'}`,
              san_count: sans.length,
              subject_alt_names: sans.slice(0, 10),
              fingerprint256: cert.fingerprint256 || cert.fingerprint
            };

            socket.destroy();
            resolve({
              status: "success",
              data: report,
              report: report
            });
          } catch (err: any) {
            socket.destroy();
            resolve({ status: "error", error: `Failed to inspect certificate: ${err?.message}` });
          }
        }
      );

      socket.on('error', (err) => {
        socket.destroy();
        resolve({ status: "error", error: `SSL Handshake Failed: ${err.message}` });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ status: "error", error: `SSL Handshake Timed out for ${domainClean}` });
      });
    });
  } catch (error: any) {
    console.error("SSL Analysis Error:", error);
    return { status: "error", error: error?.message || "SSL Check Failed." };
  }
}