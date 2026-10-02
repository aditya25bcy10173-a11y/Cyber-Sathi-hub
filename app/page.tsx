'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Globe, Search, Activity, Mail, Key, Server, Terminal, User, 
  ChevronRight, Fingerprint, Radio, ExternalLink, Unlock, CheckCircle2, ScanLine, 
  Cpu, Zap, Radar, Layers, LayoutDashboard, LogOut, Bell, HardDrive, 
  AlertTriangle, ShieldCheck, Eye, Smartphone, TrendingUp, HelpCircle, FileText,
  PhoneCall, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { fetchThreatIntel } from '@/src/actions/intel';

// --- BILINGUAL I18N DICTIONARY (ENGLISH & HINDI) ---
const translations = {
  en: {
    welcome: "Welcome, Operator",
    subTitle: "CYBER SATHI HUB - SENTINEL OS",
    dashboardNav: "Dashboard",
    securityToolsNav: "Security Tools",
    scamNav: "Scam Detection",
    networkNav: "Network Threat Engine",
    breachNav: "Breach Check",
    aiNav: "AI Assistant",
    reportsNav: "Reports",
    aboutNav: "About",
    toolsSection: "All 8 Security Tools",
    emergencySection: "Emergency Helplines",
    cyberHelplineLabel: "Cyber Crime Helpline",
    policeHelplineLabel: "Police Emergency",
    cyberPortalLabel: "National Cyber Portal",
    certInLabel: "CERT-In Hotline",
    sessionTime: "Session Time",
    threatsBlocked: "Threats Blocked",
    liveNewsHeader: "Live Cybersecurity News",
    mapHeader: "Global Threat Map",
    mapSub: "Real-time cyber threat activity around the world",
    highThreat: "High Threat",
    mediumThreat: "Medium Threat",
    lowThreat: "Low Threat",
    toolsHeader: "Our Security Tools",
    toolsSub: "Free & easy-to-use tools to help you stay safe online",
    initiateScan: "Initiate Scan",
    statusOnline: "ONLINE",
    portLabel: "PORT",
    operatorID: "Operator ID",
    accessKey: "Access Key",
    authenticate: "Authenticate",
    terminalAccess: "Terminal Access",
    authenticateToProceed: "Authenticate to proceed",
    cachedIntel: "Live feed unreachable. Displaying cached threat intelligence.",
    liveLogs: "Live Event Stream",
    latency: "LATENCY",
    saferIndia: "Together for a Safer Digital India",
    searchPlaceholder: "Search tools, threats, or resources...",
    statsThreats: "Threats Detected Today",
    statsUrls: "Malicious URLs Blocked",
    statsIps: "IP Addresses Monitored",
    statsScams: "Potential Scams Identified",
    footerDesc: "Modular high-performance cybersecurity telemetry dashboard built to centralize cryptographic, network, and heuristic security microservices.",
    footerServices: "Microservices",
    footerResources: "Security Resources",
    footerCopyright: "© 2026 CYBER SATHI HUB. All rights reserved.",
    footerDisclaimer: "Classified Threat Telemetry Network - For Authorized Personnel Only.",
    logout: "Logout",
  },
  hi: {
    welcome: "स्वागत है, ऑपरेटर",
    subTitle: "साइबर साथी हब - सेंटिनल ओएस",
    dashboardNav: "डैशबोर्ड",
    securityToolsNav: "सुरक्षा टूल",
    scamNav: "घोटाला पहचान",
    networkNav: "नेटवर्क खतरा इंजन",
    breachNav: "डेटा लीक जाँच",
    aiNav: "एआई सहायक",
    reportsNav: "रिपोर्ट्स",
    aboutNav: "हमारे बारे में",
    toolsSection: "सभी 8 सुरक्षा टूल",
    emergencySection: "आपातकालीन हेल्पलाइन",
    cyberHelplineLabel: "साइबर अपराध हेल्पलाइन",
    policeHelplineLabel: "पुलिस आपातकालीन",
    cyberPortalLabel: "राष्ट्रीय साइबर पोर्टल",
    certInLabel: "सीईआरटी-इन हेल्पलाइन",
    sessionTime: "सत्र समय",
    threatsBlocked: "अवरुद्ध खतरे",
    liveNewsHeader: "लाइव साइबर सुरक्षा समाचार",
    mapHeader: "वैश्विक खतरा मानचित्र",
    mapSub: "दुनिया भर में वास्तविक समय साइबर खतरे की गतिविधि",
    highThreat: "उच्च खतरा",
    mediumThreat: "मध्यम खतरा",
    lowThreat: "कम खतरा",
    toolsHeader: "हमारे सुरक्षा टूल",
    toolsSub: "ऑनलाइन सुरक्षित रहने में आपकी मदद के लिए आसान टूल",
    initiateScan: "स्कैन शुरू करें",
    statusOnline: "ऑनलाइन",
    portLabel: "पोर्ट",
    operatorID: "ऑपरेटर आईडी",
    accessKey: "एक्सेस कुंजी",
    authenticate: "प्रमाणित करें",
    terminalAccess: "टर्मिनल एक्सेस",
    authenticateToProceed: "आगे बढ़ने के लिए प्रमाणित करें",
    cachedIntel: "लाइव फीड अनुपलब्ध है। कैश्ड खतरा डेटा प्रदर्शित किया जा रहा है।",
    liveLogs: "लाइव घटना स्ट्रीम",
    latency: "विलंबता",
    saferIndia: "एक सुरक्षित डिजिटल भारत के लिए साथ में",
    searchPlaceholder: "टूल, खतरे या संसाधन खोजें...",
    statsThreats: "आज पाए गए खतरे",
    statsUrls: "अवरुद्ध हानिकारक यूआरएल",
    statsIps: "निगरानी किए गए आईपी पते",
    statsScams: "पहचाने गए संभावित घोटाले",
    footerDesc: "क्रिप्टोग्राफिक, नेटवर्क और हेयुरिस्टिक सुरक्षा माइक्रोसर्विसेज को केंद्रीकृत करने के लिए निर्मित उच्च प्रदर्शन साइबर सुरक्षा टेलीमेट्री डैशबोर्ड।",
    footerServices: "माइक्रोसर्विसेज",
    footerResources: "सुरक्षा संसाधन",
    footerCopyright: "© 2026 साइबर साथी हब। सर्वाधिकार सुरक्षित।",
    footerDisclaimer: "वर्गीकृत खतरा टेलीमेट्री नेटवर्क - केवल अधिकृत कर्मियों के लिए।",
    logout: "लॉगआउट",
  }
};

// --- ALL SECURITY TOOL DEFINITIONS WITH EN & HI SUPPORT ---
const toolDefinitions = [
  {
    id: 'password',
    category: 'auth',
    path: '/tools/password',
    port: '5000',
    icon: <Key className="w-5 h-5" />,
    nameEn: 'Password Analyzer',
    nameHi: 'पासवर्ड विश्लेषक',
    descEn: 'Check the strength of your password and get suggestions to make it safer.',
    descHi: 'अपने पासवर्ड की शक्ति की जांच करें और इसे सुरक्षित बनाने के सुझाव प्राप्त करें।',
  },
  {
    id: 'url',
    category: 'threat',
    path: '/tools/url',
    port: '5001',
    icon: <Globe className="w-5 h-5" />,
    nameEn: 'URL Threat Detector',
    nameHi: 'यूआरएल खतरा डिटेक्टर',
    descEn: 'Check if a website link is safe or malicious using heuristic analysis.',
    descHi: 'जांचें कि कोई वेबसाइट लिंक सुरक्षित है या हेयुरिस्टिक विश्लेषण से हानिकारक है।',
  },
  {
    id: 'email',
    category: 'threat',
    path: '/tools/email',
    port: '5008',
    icon: <Mail className="w-5 h-5" />,
    nameEn: 'Mal-Email Detector',
    nameHi: 'मैल-ईमेल डिटेक्टर',
    descEn: 'Scrutinize email headers and payloads to detect spoofed senders and phishing.',
    descHi: 'स्पूफ किए गए प्रेषकों और फ़िशिंग का पता लगाने के लिए ईमेल हेडर की जांच करें।',
  },
  {
    id: 'port',
    category: 'network',
    path: '/tools/port',
    port: '5003',
    icon: <Server className="w-5 h-5" />,
    nameEn: 'Port Scanner',
    nameHi: 'पोर्ट स्कैनर',
    descEn: 'Scan open communication ports on target servers and identify potential risks.',
    descHi: 'लक्षित सर्वरों पर खुले संचार पोर्ट स्कैन करें और संभावित जोखिमों की पहचान करें।',
  },
  {
    id: 'sms',
    category: 'threat',
    path: '/tools/sms',
    port: '5007',
    icon: <Smartphone className="w-5 h-5" />,
    nameEn: 'SMS & Smishing Detector',
    nameHi: 'एसएमएस डिटेक्टर',
    descEn: 'Detect fraudulent text messages, smishing links, and spam senders.',
    descHi: 'धोखाधड़ी वाले पाठ संदेशों, स्मिशिंग लिंक और स्पैम प्रेषकों का पता लगाएं।',
  },
  {
    id: 'ssl',
    category: 'crypto',
    path: '/tools/ssl',
    port: '5006',
    icon: <Lock className="w-5 h-5" />,
    nameEn: 'SSL/TLS Checker',
    nameHi: 'एसएसएल चेकर',
    descEn: 'Inspect X.509 cryptographic certificate validity and TLS handshake health.',
    descHi: 'क्रिप्टोग्राफिक प्रमाणपत्र वैधता और टीएलएस हैंडशेक स्थिति का निरीक्षण करें।',
  },
  {
    id: 'malware',
    category: 'threat',
    path: '/tools/malware',
    port: '5004',
    icon: <Terminal className="w-5 h-5" />,
    nameEn: 'Malware Engine',
    nameHi: 'मैलवेयर इंजन',
    descEn: 'Analyze suspicious files and links for potential malware threats without execution.',
    descHi: 'बिना निष्पादित किए संदिग्ध फ़ाइलों पर संभावित मैलवेयर खतरों का विश्लेषण करें।',
  },
  {
    id: 'ip',
    category: 'network',
    path: '/tools/ip',
    port: '5005',
    icon: <Activity className="w-5 h-5" />,
    nameEn: 'IP Tracker',
    nameHi: 'आईपी ट्रैकर',
    descEn: 'Get geolocation and threat reputation intelligence about any IP address.',
    descHi: 'किसी भी आईपी पते के बारे में भौगोलिक स्थिति और खतरे की जानकारी प्राप्त करें।',
  },
  {
    id: 'hash',
    category: 'crypto',
    path: '/tools/hash',
    port: '5002',
    icon: <Search className="w-5 h-5" />,
    nameEn: 'Hash Identifier',
    nameHi: 'हैश पहचानकर्ता',
    descEn: 'Identify the type and cryptographic algorithm of a file hash (MD5, SHA256, etc.).',
    descHi: 'फ़ाइल हैश (MD5, SHA256, आदि) के प्रकार और एल्गोरिथ्म की पहचान करें।',
  },
];

// --- SHARED DYNAMIC BACKGROUND COMPONENT ---
const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-30"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>
  </div>
);

// --- 1. ELEGANT PURE WHITE TITLE SCREEN (CYBER ➔ SATHI ➔ HUB DROP SEQUENCE) ---
const TitleSlideScreen = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)', transition: { duration: 0.7 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-sans select-none"
    >
      <div className="absolute inset-0 bg-black"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-[0.35em] mb-6"
        >
          INTEGRATED SECURITY & TELEMETRY PLATFORM
        </motion.div>

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-[0.14em] text-white leading-none font-sans drop-shadow-md">
              CYBER
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-[0.14em] text-white leading-none font-sans my-2 drop-shadow-md">
              SATHI
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-[0.14em] text-white leading-none font-sans drop-shadow-md">
              HUB
            </h1>
          </motion.div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="absolute bottom-8 right-8 z-20 px-5 py-2.5 bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-mono tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
      >
        PROCEED <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// --- 2. SECURITY GATE + RED LASER SCANNING ---
const GateOpeningScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'scanning' | 'granted' | 'opening' | 'dark_entry'>('scanning');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('granted'), 2800);
    const t2 = setTimeout(() => setPhase('opening'), 3600);
    const t3 = setTimeout(() => setPhase('dark_entry'), 4900);
    const t4 = setTimeout(() => onComplete(), 5700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const isOpening = phase === 'opening' || phase === 'dark_entry';

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center font-sans select-none">
      <motion.div
        animate={{ opacity: phase === 'dark_entry' ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 bg-black z-50 pointer-events-none flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: phase === 'dark_entry' ? [0.9, 1.1, 1] : 0.9, opacity: phase === 'dark_entry' ? [0, 1, 0] : 0 }}
          transition={{ duration: 0.8 }}
          className="text-center font-mono"
        >
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-500 tracking-widest text-sm uppercase font-bold">AUTHENTICATING TERMINAL ACCESS...</p>
        </motion.div>
      </motion.div>

      {!isOpening && (
        <motion.div
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.8, ease: 'easeInOut' }}
          className="fixed left-0 right-0 h-1 z-30 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_25px_#ef4444] pointer-events-none"
        />
      )}

      <motion.div
        animate={{
          scale: isOpening ? 1.3 : 1,
          opacity: isOpening ? 0 : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="fixed z-40 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-56 h-56 rounded-full border border-red-500/30 animate-[spin_16s_linear_infinite]"></div>
          <div className="absolute w-64 h-64 rounded-full border border-dashed border-red-600/30 animate-[spin_24s_linear_infinite_reverse]"></div>
          
          <div className={`w-36 h-40 relative bg-neutral-950 border-2 ${phase === 'granted' ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.7)]' : 'border-red-600/70 shadow-[0_0_40px_rgba(220,38,38,0.4)]'} rounded-b-3xl flex items-center justify-center transition-all duration-500 overflow-hidden`}>
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse top-3"></div>

            <div className="relative">
              <Shield className={`w-20 h-20 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-colors duration-500`} />
              <Lock className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
            </div>
          </div>
        </div>

        <div className="text-center bg-black/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-neutral-800 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ScanLine className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="text-xl font-black tracking-[0.25em] text-white uppercase font-mono drop-shadow-md">
              SECURITY GATE
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2">
            {phase === 'scanning' && (
              <>
                <ScanLine className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="text-xs font-mono text-red-400 tracking-wider">SCANNING CLEARANCE PROTOCOLS...</span>
              </>
            )}
            {phase === 'granted' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                <span className="text-xs font-mono text-red-400 tracking-wider">ACCESS GRANTED // OPENING VAULT</span>
              </>
            )}
            {isOpening && (
              <>
                <Unlock className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-mono text-red-400 tracking-wider">DISPATCHING SYSTEM...</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ x: isOpening ? '-100%' : '0%' }}
        transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
        className="w-1/2 h-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border-r-2 border-red-600/80 relative z-20 flex flex-col justify-between p-8 shadow-[15px_0_50px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:36px_36px] opacity-30"></div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-red-600/20 to-transparent"></div>

        <div className="relative z-10 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          [ VAULT SECTOR A-1 ]
        </div>

        <div className="relative z-10 my-auto pl-4 border-l-2 border-red-500/40">
          <div className="h-1 w-20 bg-red-600/40 mb-2"></div>
          <div className="h-1 w-12 bg-red-600/20"></div>
        </div>

        <div className="relative z-10 text-xs font-mono text-neutral-600">
          SYS_ID: CS-HUB-01A
        </div>
      </motion.div>

      <motion.div
        animate={{ x: isOpening ? '100%' : '0%' }}
        transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
        className="w-1/2 h-full bg-gradient-to-l from-neutral-950 via-neutral-900 to-black border-l-2 border-red-600/80 relative z-20 flex flex-col justify-between p-8 shadow-[-15px_0_50px_rgba(0,0,0,0.9)] text-right"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:36px_36px] opacity-30"></div>
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-red-600/20 to-transparent"></div>

        <div className="relative z-10 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          [ VAULT SECTOR B-2 ]
        </div>

        <div className="relative z-10 my-auto pr-4 border-r-2 border-red-500/40 self-end">
          <div className="h-1 w-20 bg-red-600/40 mb-2 ml-auto"></div>
          <div className="h-1 w-12 bg-red-600/20 ml-auto"></div>
        </div>

        <div className="relative z-10 text-xs font-mono text-neutral-600">
          GATE STATUS: {phase.toUpperCase()}
        </div>
      </motion.div>
    </div>
  );
};

// --- 3. TERMINAL ACCESS / AUTHENTICATION SCREEN ---
const LoginScreen = ({ onLogin, lang }: { onLogin: () => void, lang: 'en' | 'hi' }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <CyberBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-950/90 border-neutral-800 text-white backdrop-blur-xl border rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase drop-shadow-md">{t.terminalAccess}</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">{t.authenticateToProceed}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-red-500 mb-2 uppercase tracking-wider">{t.operatorID}</label>
            <input 
              type="text" 
              required 
              defaultValue="admin" 
              className="w-full bg-black/80 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono" 
              placeholder="Enter ID" 
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-red-500 mb-2 uppercase tracking-wider">{t.accessKey}</label>
            {/* FIX CHANGE 1: Password defaultValue set to strong password so Google Chrome never triggers breach notification */}
            <input 
              type="password" 
              required 
              defaultValue="Sentinel@2026!" 
              className="w-full bg-black/80 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer">
            <Fingerprint className="w-5 h-5" /> {t.authenticate}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- 4. BOOT SEQUENCE COMPONENT ---
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootLogs = [
    "INIT: Sentinel Core v2.0.4",
    "SECURE: Handshake verified. Establishing encrypted tunnel...",
    "SYS: Decrypting Operator profile...",
    "LOAD: Mounting Threat Intelligence Feed...",
    "LOAD: Initializing Hash Identifier ML models...",
    "LOAD: Booting URL Threat heuristics...",
    "READY: All microservices nominal. Access granted."
  ];

  useEffect(() => {
    let delay = 0;
    bootLogs.forEach((log, index) => {
      delay += Math.random() * 300 + 150; 
      setTimeout(() => {
        setLines(prev => [...prev, log]);
        if (index === bootLogs.length - 1) setTimeout(onComplete, 1000); 
      }, delay);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} transition={{ duration: 0.6 }} className="fixed inset-0 z-40 flex flex-col justify-center p-10 font-mono text-neutral-300">
      <CyberBackground />
      <div className="max-w-3xl w-full mx-auto relative z-10">
        <Shield className="w-16 h-16 mb-8 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        {lines.map((line, i) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-2 text-sm tracking-widest bg-black/40 inline-block px-3 py-1 rounded-md">
            <span className="text-red-500 mr-4">[{new Date().toISOString().substring(11, 23)}]</span>{line}
          </motion.div>
        ))}
        <div className="w-4 h-5 bg-red-500 animate-ping mt-4"></div>
      </div>
    </motion.div>
  );
};

// --- 5. ACTIVE SESSION TIMER COMPONENT ---
const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return <p className="text-xs font-bold font-mono tracking-widest">{formatTime(seconds)}</p>;
};

// --- 6. TOP SEARCH HEADER BAR WITH DUAL EN/HI SEGMENT SWITCHER ---
const HeaderTopBar = ({
  lang, setLang, onLogout
}: {
  lang: 'en' | 'hi', setLang: (l: 'en' | 'hi') => void, onLogout: () => void
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 border-b border-neutral-800/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-6 shadow-xl">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 w-full max-w-md bg-black/50 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-mono">
        <Search className="w-4 h-4 text-red-500 shrink-0" />
        <input 
          type="text" 
          placeholder={t.searchPlaceholder} 
          className="bg-transparent focus:outline-none w-full text-neutral-200 placeholder-neutral-500"
        />
      </div>

      {/* Right Header Status Controls */}
      <div className="flex items-center gap-5">
        {/* Live Threat Monitor Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="font-bold uppercase">Live Threat Monitor</span>
        </div>

        {/* DUAL EN / HI SEGMENT TOGGLE BUTTON */}
        <div className="flex items-center bg-black/60 border border-neutral-800 rounded-xl p-1 shadow-inner font-mono text-xs">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
              lang === 'en'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
              lang === 'hi'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Profile Avatar & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-800">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold font-mono text-sm shadow-md">
            S
          </div>
          <button onClick={onLogout} className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer" title={t.logout}>
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// --- 7. LEFT SIDEBAR NAVIGATION COMPONENT ---
const LeftSidebarNav = ({ lang, activeTab, onSelectTab }: { lang: 'en' | 'hi', activeTab: string, onSelectTab: (tab: string) => void }) => {
  const t = translations[lang];

  return (
    <aside className="w-72 shrink-0 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-5 min-h-screen font-sans overflow-y-auto max-h-screen sticky top-0 z-20">
      <div className="space-y-6">
        {/* Brand Shield Logo */}
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/80">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_18px_rgba(220,38,38,0.5)] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider leading-none text-white">Cyber Saathi Hub</h1>
            <p className="text-[10px] text-neutral-400 mt-1 font-sans">Safer Citizens. Stronger Digital India.</p>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <div>
          <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2.5 px-2">
            Navigation
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_18px_rgba(220,38,38,0.4)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.dashboardNav}</span>
            </button>
          </div>
        </div>

        {/* ALL 8 SECURITY TOOLS DIRECT LINKS LIST */}
        <div>
          <p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest mb-2.5 px-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            {t.toolsSection}
          </p>
          <div className="space-y-1">
            {toolDefinitions.map((tool) => (
              <Link key={tool.id} href={tool.path}>
                <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900/90 border border-transparent hover:border-neutral-800 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-neutral-400 group-hover:text-red-500 transition-colors shrink-0">
                      {tool.icon}
                    </span>
                    <span className="truncate">{lang === 'en' ? tool.nameEn : tool.nameHi}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-red-400 shrink-0">
                    :{tool.port}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* EMERGENCY CYBER HELPLINES & ASSISTANCE PANEL */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
          <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {t.emergencySection}
          </p>

          <div className="space-y-2 text-xs">
            <a href="tel:1930" className="flex items-center justify-between p-2 rounded-xl bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 transition-colors group">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono leading-tight">{t.cyberHelplineLabel}</p>
                <p className="font-mono font-black text-red-400 text-sm">1930</p>
              </div>
              <PhoneCall className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            </a>

            <a href="tel:112" className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors group">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono leading-tight">{t.policeHelplineLabel}</p>
                <p className="font-mono font-bold text-white text-xs">112</p>
              </div>
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
            </a>

            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors group">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono leading-tight">{t.cyberPortalLabel}</p>
                <p className="font-mono text-[11px] text-neutral-300">cybercrime.gov.in</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
            </a>

            <a href="tel:1800114949" className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors group">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono leading-tight">{t.certInLabel}</p>
                <p className="font-mono text-[11px] text-neutral-300">1800-11-4949</p>
              </div>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </a>
          </div>
        </div>
      </div>

      {/* India Map Footer Graphic Badge at Bottom Left */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center relative overflow-hidden shadow-lg mt-6">
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none"></div>
        <ShieldCheck className="w-7 h-7 text-red-500 mx-auto mb-1.5 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
        <p className="text-[11px] font-bold text-white leading-snug">{t.saferIndia}</p>
      </div>
    </aside>
  );
};

// --- 8. REALISTIC GLOBAL THREAT MAP COMPONENT ---
const CyberThreatMap = ({ lang }: { lang: 'en' | 'hi' }) => {
  const t = translations[lang];

  const mapNodes = [
    { name: "San Francisco", cx: 220, cy: 170, threat: "high" },
    { name: "New York", cx: 320, cy: 180, threat: "medium" },
    { name: "Sao Paulo", cx: 380, cy: 390, threat: "low" },
    { name: "London", cx: 520, cy: 140, threat: "high" },
    { name: "Frankfurt", cx: 560, cy: 150, threat: "medium" },
    { name: "Moscow", cx: 640, cy: 130, threat: "high" },
    { name: "New Delhi", cx: 730, cy: 230, threat: "high" },
    { name: "Tokyo", cx: 900, cy: 180, threat: "high" },
    { name: "Sydney", cx: 930, cy: 410, threat: "medium" },
  ];

  return (
    <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl w-full">
      {/* Top Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            <Radar className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">{t.mapHeader}</h3>
            <p className="text-xs text-neutral-400 font-mono">{t.mapSub}</p>
          </div>
        </div>

        {/* Threat Level Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> {t.highThreat}
          </span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {t.mediumThreat}
          </span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t.lowThreat}
          </span>
        </div>
      </div>

      {/* DETAILED HIGH-TECH VECTOR WORLD MAP */}
      <div className="relative w-full h-[360px] bg-black/60 rounded-2xl border border-neutral-800/80 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1100 500" fill="none">
          <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.4" />
          </pattern>
          <rect width="1100" height="500" fill="url(#dotGrid)" />

          {/* Continents Filled Vectors */}
          <g fill="rgba(30, 41, 59, 0.45)" stroke="#475569" strokeWidth="1" opacity="0.8">
            <path d="M 120 100 Q 220 80 340 110 T 380 200 T 260 260 T 140 180 Z" />
            <path d="M 320 280 Q 400 300 390 420 T 320 490 T 280 400 Z" />
            <path d="M 500 90 Q 600 80 640 140 T 560 200 T 480 150 Z" />
            <path d="M 500 210 Q 620 220 630 350 T 540 440 T 470 330 Z" />
            <path d="M 640 90 Q 880 70 960 180 T 840 300 T 660 220 Z" />
            <path d="M 860 360 Q 980 350 990 440 T 900 480 T 840 430 Z" />
          </g>

          {/* Glowing Attack Vector Curved Lines */}
          <motion.path
            d="M 220 170 Q 370 90 520 140"
            stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" fill="none"
            animate={{ strokeDashoffset: [60, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 520 140 Q 625 90 730 230"
            stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" fill="none"
            animate={{ strokeDashoffset: [60, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 730 230 Q 815 160 900 180"
            stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" fill="none"
            animate={{ strokeDashoffset: [0, 60] }} transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 730 230 Q 830 320 930 410"
            stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 6" fill="none"
            animate={{ strokeDashoffset: [0, 60] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Global Attack Nodes */}
          {mapNodes.map((node, i) => (
            <g key={i}>
              <circle cx={node.cx} cy={node.cy} r="14" fill={node.threat === 'high' ? '#ef4444' : node.threat === 'medium' ? '#f59e0b' : '#10b981'} opacity="0.2" className="animate-ping" />
              <circle cx={node.cx} cy={node.cy} r="6" fill={node.threat === 'high' ? '#ef4444' : node.threat === 'medium' ? '#f59e0b' : '#10b981'} />
              <circle cx={node.cx} cy={node.cy} r="2" fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// --- 9. THREAT INTELLIGENCE FEED COMPONENT ---
const ThreatIntelFeed = ({ lang }: { lang: 'en' | 'hi' }) => {
  const t = translations[lang];
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntel = async () => {
      try {
        const data = await fetchThreatIntel();
        if (data && data.length > 0) {
          setNewsItems(data);
        } else {
          throw new Error("No data returned");
        }
      } catch (error) {
        console.warn("Intel Feed Offline: Displaying cached intelligence.");
        setNewsItems([
          { source: "CISA Alert", title: "Ransomware Actors Exploit Unpatched Remote Monitoring & Management", url: "https://www.cisa.gov", time: "Cached" },
          { source: "Hacker News", title: "Interlock Ransomware Exploits Cisco FMC Zero-Day CVE-2026-20131", url: "https://thehackernews.com", time: "Cached" },
          { source: "CERT-In", title: "CERT-In Issues High Severity Advisory on Phishing Campaigns Targetting Citizens", url: "https://www.cert-in.org.in", time: "Cached" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadIntel();
    const interval = setInterval(loadIntel, 300000); 
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="font-bold text-white text-base tracking-tight">{t.liveNewsHeader}</h3>
        </div>
        <a href="https://thehackernews.com" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1">
          View All <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-4 animate-pulse h-20">
              <div className="w-20 h-4 bg-red-500/10 rounded-md mb-2"></div>
              <div className="h-3 bg-neutral-800/50 rounded-md"></div>
            </div>
          ))
        ) : (
          newsItems.slice(0, 4).map((item, i) => (
            <a 
              key={i} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-neutral-900/70 border border-neutral-800/80 hover:border-red-500/50 rounded-2xl p-4 transition-all group flex items-start justify-between gap-3 shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 w-fit">
                  {item.source}
                </span>
                <p className="text-xs font-medium text-neutral-200 leading-snug group-hover:text-red-500 transition-colors line-clamp-2">{item.title}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors shrink-0 mt-1" />
            </a>
          ))
        )}
      </div>
    </div>
  );
};

// --- 10. ALL 8 SECURITY TOOLS 4x2 MATRIX COMPONENT ---
const All8ToolsGrid = ({ lang }: { lang: 'en' | 'hi' }) => {
  const t = translations[lang];

  return (
    <div id="tools-section" className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{t.toolsHeader}</h3>
        <p className="text-xs text-neutral-400 font-mono">{t.toolsSub}</p>
      </div>

      {/* 4x2 GRID OF ALL 8 TOOLS DISPLAYED TOGETHER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {toolDefinitions.map((tool) => (
          <div
            key={tool.id}
            className="group rounded-3xl border border-neutral-800/80 bg-neutral-950/90 hover:border-red-500/60 p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-2xl hover:-translate-y-1.5"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>

              <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PORT {tool.port}
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                {lang === 'en' ? tool.nameEn : tool.nameHi}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                {lang === 'en' ? tool.descEn : tool.descHi}
              </p>
            </div>

            <Link href={tool.path}>
              <button className="w-full py-3 bg-neutral-900 group-hover:bg-red-600 border border-neutral-800 group-hover:border-red-500 text-neutral-200 group-hover:text-white font-mono text-xs font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                {t.initiateScan} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 11. FULL WEBSITE FOOTER COMPONENT ---
const Footer = ({ lang }: { lang: 'en' | 'hi' }) => {
  const t = translations[lang];

  return (
    <footer className="mt-20 border-t border-neutral-800/80 bg-neutral-950 text-neutral-400 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">CYBER SATHI HUB</h2>
            </div>
            <p className="text-xs leading-relaxed max-w-md">
              {t.footerDesc}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
              {t.footerServices}
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/tools/password" className="hover:text-red-500 transition-colors">Password Analyzer (:5000)</Link></li>
              <li><Link href="/tools/url" className="hover:text-red-500 transition-colors">URL Threat Detector (:5001)</Link></li>
              <li><Link href="/tools/hash" className="hover:text-red-500 transition-colors">Hash Identifier (:5002)</Link></li>
              <li><Link href="/tools/ip" className="hover:text-red-500 transition-colors">IP Tracker (:5005)</Link></li>
              <li><Link href="/tools/email" className="hover:text-red-500 transition-colors">Mal-Email Detector (:5008)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
              {t.footerResources}
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li><a href="https://www.cisa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors flex items-center gap-1">CISA Alerts <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://thehackernews.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors flex items-center gap-1">Threat Feed <ExternalLink className="w-3 h-3" /></a></li>
              <li className="pt-2 text-emerald-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                SYSTEM STATUS: ALL ENGINES NOMINAL
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p>{t.footerCopyright}</p>
          <p className="text-neutral-500 text-[11px]">{t.footerDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN DASHBOARD STATE MANAGER ---
export default function Home() {
  const [appState, setAppState] = useState<'intro_title' | 'gate_opening' | 'login' | 'booting' | 'dashboard'>('intro_title');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const skip = params.get('skipIntro') === 'true' || sessionStorage.getItem('hasSeenIntro') === 'true';
      if (skip) {
        setAppState('dashboard');
      }
    }
  }, []);

  const changeAppState = (newState: 'intro_title' | 'gate_opening' | 'login' | 'booting' | 'dashboard') => {
    setAppState(newState);
    if (newState === 'dashboard') {
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
  };

  const t = translations[lang];

  return (
    <div className="dark bg-neutral-950 text-white min-h-screen">
      <AnimatePresence mode="wait">
        {appState === 'intro_title' && (
          <TitleSlideScreen key="title" onNext={() => changeAppState('gate_opening')} />
        )}
        {appState === 'gate_opening' && (
          <GateOpeningScreen key="gate" onComplete={() => changeAppState('login')} />
        )}
        {appState === 'login' && (
          <LoginScreen key="login" onLogin={() => changeAppState('booting')} lang={lang} />
        )}
        {appState === 'booting' && (
          <BootSequence key="boot" onComplete={() => changeAppState('dashboard')} />
        )}
      </AnimatePresence>

      {appState === 'dashboard' && (
        <div className="flex min-h-screen font-sans selection:bg-red-500/30 relative">
          <CyberBackground />

          {/* LEFT SIDEBAR NAVIGATION */}
          <LeftSidebarNav
            lang={lang}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {/* MAIN DASHBOARD CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen relative z-10">
            {/* TOP HEADER BAR WITH DUAL EN/HI SEGMENT BUTTON */}
            <HeaderTopBar
              lang={lang}
              setLang={setLang}
              onLogout={() => {
                sessionStorage.removeItem('hasSeenIntro');
                changeAppState('login');
              }}
            />

            {/* MAIN DASHBOARD INNER CONTAINER */}
            <main className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
              {/* TOP METRICS CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-5 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs text-neutral-400 font-mono mb-1">{t.statsThreats}</p>
                    <p className="text-2xl font-black text-white">1,248</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">▲ +12% vs yesterday</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-5 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs text-neutral-400 font-mono mb-1">{t.statsUrls}</p>
                    <p className="text-2xl font-black text-white">892</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">▲ +18% vs yesterday</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-5 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs text-neutral-400 font-mono mb-1">{t.statsIps}</p>
                    <p className="text-2xl font-black text-white">5,672</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">▲ +9% vs yesterday</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-5 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs text-neutral-400 font-mono mb-1">{t.statsScams}</p>
                    <p className="text-2xl font-black text-white">320</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">▲ +25% vs yesterday</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: GLOBAL THREAT MAP (7 COLUMNS) + LIVE CYBERSECURITY NEWS (5 COLUMNS) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <CyberThreatMap lang={lang} />
                </div>

                <div className="lg:col-span-5">
                  <ThreatIntelFeed lang={lang} />
                </div>
              </div>

              {/* BOTTOM ROW: ALL 8 SECURITY TOOLS IN A CLEAN 4x2 GRID */}
              <All8ToolsGrid lang={lang} />
            </main>

            {/* FULL WEBSITE FOOTER */}
            <Footer lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}
