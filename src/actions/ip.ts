"use server"

import dns from 'dns/promises';

export interface IpAnalysisResponse {
  status: "success" | "error";
  report?: any;
  data?: any;
  error?: string;
}

export async function analyzeIp(targetIp: string): Promise<IpAnalysisResponse> {
  try {
    const rawTarget = (targetIp || '').trim();
    if (!rawTarget) {
      return { status: "error", error: "No IP address or hostname provided." };
    }

    let resolvedIp = rawTarget;
    // If not direct IP, resolve hostname
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rawTarget) && !rawTarget.includes(':')) {
      const cleanHost = rawTarget.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].split(':')[0];
      try {
        const lookup = await dns.lookup(cleanHost);
        resolvedIp = lookup.address;
      } catch {
        resolvedIp = rawTarget;
      }
    }

    // Query IP-API
    const queryTarget = resolvedIp.toLowerCase() === 'me' ? '' : resolvedIp;
    const apiUrl = `http://ip-api.com/json/${queryTarget}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query`;
    
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`IP intelligence provider returned ${res.status}`);
    }

    const info = await res.json();
    if (info.status === 'fail') {
      return { status: "error", error: info.message || "IP lookup failed. Invalid IP or domain." };
    }

    const report = {
      status: "success",
      ip: info.query || resolvedIp,
      target_input: rawTarget,
      resolved_ip: resolvedIp,
      geo: {
        country: info.country,
        countryCode: info.countryCode,
        region: info.regionName,
        city: info.city,
        zip: info.zip,
        lat: info.lat,
        lon: info.lon,
        timezone: info.timezone,
        maps_url: info.lat && info.lon ? `https://www.google.com/maps?q=${info.lat},${info.lon}` : null
      },
      network: {
        isp: info.isp,
        organization: info.org,
        as: info.as,
        asname: info.asname
      },
      security_flags: {
        mobile: info.mobile ?? false,
        proxy_vpn: info.proxy ?? false,
        hosting_dc: info.hosting ?? false,
        threat_status: info.proxy ? "SUSPICIOUS (Proxy/VPN/Tor)" : "CLEAN"
      }
    };

    return {
      status: "success",
      data: report,
      report: report
    };
  } catch (error: any) {
    console.error("IP Analysis Error:", error);
    return { status: "error", error: error?.message || "IP Intelligence Engine Error." };
  }
}