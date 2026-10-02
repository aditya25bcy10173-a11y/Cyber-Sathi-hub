'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ArrowLeft, Activity, AlertTriangle, ShieldAlert, ShieldCheck, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import { analyzeSms } from '@/src/actions/sms';

const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function SmsDetector() {
  const [smsInput, setSmsInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem('hasSeenIntro', 'true');
  }, []);

  const runSmsScan = async () => {
    if (!smsInput.trim()) return;
    
    setIsScanning(true);
    setError(null);
    setReport(null);

    const response = await analyzeSms(smsInput.trim());

    if (response.error) {
      setError(response.error);
    } else if (response.status === 'success') {
      setReport(response.report || response.data || response);
    } else {
      setError("Unknown error occurred during SMS analysis.");
    }
    
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-500/30 overflow-y-auto relative p-6 md:p-12">
      <CyberBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/?skipIntro=true" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors font-mono text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return to Command Center
          </Link>
          <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-neutral-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
            <span className="text-xs font-mono text-neutral-300 tracking-wider">Engine: Port 5007</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shadow-lg">
            <Smartphone className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">SMS & Smishing Detector</h1>
            <p className="text-neutral-400 font-mono text-sm">Fraudulent SMS, OTP Scam & Phishing Token Detection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-3xl shadow-2xl flex flex-col h-full">
            <label className="block text-xs font-mono text-red-500 mb-4 uppercase tracking-wider">Suspicious SMS Text Content</label>
            <textarea 
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              className="w-full flex-1 bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl px-5 py-4 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono min-h-[220px] resize-none"
              placeholder="Paste SMS message here (e.g. 'Dear user, your electricity will be disconnected tonight. Update KYC: bit.ly/kyc-update')..."
            />
            <button 
              onClick={runSmsScan}
              disabled={isScanning || smsInput.length === 0}
              className="w-full mt-6 bg-black hover:bg-red-600/20 border border-neutral-700 hover:border-red-500 text-white disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-black rounded-xl py-4 font-bold tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isScanning ? (
                <><Activity className="w-5 h-5 animate-spin text-red-500" /> CLASSIFYING SMS PAYLOAD...</>
              ) : (
                <><MessageSquareWarning className="w-5 h-5" /> SCAN SMS FOR FRAUD</>
              )}
            </button>
          </div>

          {/* Output Dashboard */}
          <div className="bg-black/90 border border-neutral-800/80 rounded-3xl shadow-2xl p-8 flex flex-col min-h-[400px]">
            <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-4 mb-6">Smishing Intelligence Report</h2>
            
            {!isScanning && !report && !error && (
              <div className="flex-1 flex items-center justify-center text-neutral-600 font-mono text-sm">
                [ Awaiting SMS Payload ]
              </div>
            )}

            {isScanning && (
              <div className="flex-1 flex flex-col justify-center text-red-500 font-mono text-sm animate-pulse space-y-2">
                <p>&gt; Establishing secure link to Port 5007...</p>
                <p>&gt; Normalizing message tokens and regex masks...</p>
                <p>&gt; Running TF-IDF / Smishing Model Classifier...</p>
                <p>&gt; Evaluating OTP extraction & urgency signals...</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">ENGINE OFFLINE</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                  <span className="text-sm font-mono text-neutral-400 uppercase tracking-widest">Threat Verdict</span>
                  <span className={`text-lg font-bold tracking-widest ${report.severity === 'HIGH' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : report.severity === 'MEDIUM' ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {report.verdict}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-mono text-red-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4" /> Detected Risk Signals
                  </h3>
                  {report.indicators && report.indicators.length > 0 ? (
                    <ul className="space-y-2">
                      {report.indicators.map((ind: string, i: number) => (
                        <li key={i} className="text-sm text-neutral-300 font-mono bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-start gap-3">
                          <span className="text-red-500 mt-0.5 shrink-0">►</span> {ind}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-mono text-emerald-500 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">No overt smishing indicators found.</p>
                  )}
                </div>

                <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-left">
                  <pre className="text-xs text-neutral-400 whitespace-pre-wrap break-all">
                    {JSON.stringify(report, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
