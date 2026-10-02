'use client';

import { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  AlertTriangle,
  Fingerprint,
  Activity,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase';
import { useRouter } from 'next/navigation';

const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020304]">
    {/* Existing background */}
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center opacity-30" />

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,80,100,0.12),transparent_55%)]" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

    {/* Cyber grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:45px_45px]" />

    {/* Scan lines */}
    <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.15)_50%)] bg-[size:100%_4px]" />

    {/* Ambient glow */}
    <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
  </div>
);

const SentinelCore = () => (
  <div className="relative flex items-center justify-center w-44 h-44">
    {/* Outer rotating ring */}
    <div className="absolute inset-0 rounded-full border border-cyan-400/20 border-t-cyan-400/80 animate-[spin_8s_linear_infinite]" />

    {/* Second ring */}
    <div className="absolute inset-4 rounded-full border border-red-500/20 border-b-red-500/80 animate-[spin_5s_linear_infinite_reverse]" />

    {/* Third ring */}
    <div className="absolute inset-8 rounded-full border border-cyan-300/20 border-l-cyan-300/70 animate-[spin_3s_linear_infinite]" />

    {/* Core glow */}
    <div className="absolute h-20 w-20 rounded-full bg-cyan-400/10 blur-xl" />

    {/* Core */}
    <div className="relative h-20 w-20 rounded-full border border-cyan-300/60 bg-[#061015] flex items-center justify-center shadow-[0_0_45px_rgba(34,211,238,0.25)]">
      <Shield className="h-9 w-9 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
    </div>

    {/* Small orbit dots */}
    <span className="absolute top-2 left-1/2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
    <span className="absolute bottom-6 right-5 h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" />
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // EXISTING LOGIN LOGIC — UNCHANGED
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }

    setLoading(false);
  };

  // EXISTING REGISTER LOGIC — UNCHANGED
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Registration logged. Check your email for verification.');
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020304] text-white font-sans">
      <CyberBackground />

      {/* TOP STATUS BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-cyan-400/10 bg-black/20 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/5">
            <Shield className="h-4 w-4 text-cyan-300" />
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-white">
              SENTINEL
            </p>
            <p className="text-[9px] tracking-[0.2em] text-cyan-400/50">
              SECURITY COMMAND SYSTEM
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-5 text-[9px] font-mono tracking-widest text-neutral-500 sm:flex">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            CORE ONLINE
          </span>

          <span className="flex items-center gap-2">
            <Radio className="h-3 w-3" />
            SECURE CHANNEL
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-8 pt-24">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_430px]">

          {/* LEFT SIDE — SENTINEL CORE */}
          <section className="hidden lg:flex flex-col items-center justify-center">
            <SentinelCore />

            <div className="mt-6 text-center">
              <p className="font-mono text-[10px] tracking-[0.45em] text-cyan-400/60">
                SENTINEL CORE
              </p>

              <h1 className="mt-3 text-5xl font-black tracking-[0.12em] text-white">
                SENTINEL
              </h1>

              <p className="mt-3 max-w-md font-mono text-xs leading-6 tracking-wider text-neutral-500">
                ADVANCED THREAT DETECTION
                <br />
                & SECURITY INTELLIGENCE PLATFORM
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <div className="rounded-lg border border-cyan-400/10 bg-black/30 px-4 py-2 backdrop-blur">
                <p className="text-[8px] tracking-widest text-neutral-600">
                  SYSTEM
                </p>
                <p className="mt-1 text-[10px] font-mono text-cyan-300">
                  ONLINE
                </p>
              </div>

              <div className="rounded-lg border border-cyan-400/10 bg-black/30 px-4 py-2 backdrop-blur">
                <p className="text-[8px] tracking-widest text-neutral-600">
                  NETWORK
                </p>
                <p className="mt-1 text-[10px] font-mono text-cyan-300">
                  SECURE
                </p>
              </div>

              <div className="rounded-lg border border-red-400/10 bg-black/30 px-4 py-2 backdrop-blur">
                <p className="text-[8px] tracking-widest text-neutral-600">
                  THREAT
                </p>
                <p className="mt-1 text-[10px] font-mono text-red-400">
                  MONITORED
                </p>
              </div>
            </div>
          </section>

          {/* LOGIN PANEL */}
          <section className="relative">
            {/* Corner decorations */}
            <div className="absolute -left-1 -top-1 h-7 w-7 border-l border-t border-cyan-400/60" />
            <div className="absolute -right-1 -top-1 h-7 w-7 border-r border-t border-cyan-400/60" />
            <div className="absolute -bottom-1 -left-1 h-7 w-7 border-b border-l border-cyan-400/60" />
            <div className="absolute -bottom-1 -right-1 h-7 w-7 border-b border-r border-cyan-400/60" />

            <div className="rounded-2xl border border-white/10 bg-black/65 p-7 shadow-2xl backdrop-blur-2xl sm:p-9">

              {/* Mobile logo */}
              <div className="mb-7 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/5">
                  <Shield className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="font-bold tracking-[0.25em]">SENTINEL</p>
                  <p className="text-[9px] tracking-widest text-neutral-500">
                    SECURITY CORE
                  </p>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-[9px] tracking-[0.3em] text-cyan-400/70">
                    AUTHENTICATION REQUIRED
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome, Operator
                </h2>

                <p className="mt-2 font-mono text-xs leading-5 text-neutral-500">
                  Authenticate to access the Sentinel command center.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                  <p className="font-mono text-[10px] leading-5 text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <form className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="mb-2 block font-mono text-[9px] tracking-[0.25em] text-neutral-600">
                    OPERATOR ID
                  </label>

                  <div className="group relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600 transition-colors group-focus-within:text-cyan-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@email.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-3.5 pl-11 pr-4 font-mono text-xs text-white outline-none transition-all placeholder:text-neutral-700 focus:border-cyan-400/50 focus:bg-cyan-400/[0.02] focus:shadow-[0_0_25px_rgba(34,211,238,0.06)]"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block font-mono text-[9px] tracking-[0.25em] text-neutral-600">
                    ACCESS PASSPHRASE
                  </label>

                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600 transition-colors group-focus-within:text-red-400" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-3.5 pl-11 pr-4 font-mono text-xs text-white outline-none transition-all placeholder:text-neutral-700 focus:border-red-400/50 focus:bg-red-400/[0.02] focus:shadow-[0_0_25px_rgba(248,113,113,0.06)]"
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-cyan-400 py-3.5 text-xs font-black tracking-[0.18em] text-black transition-all hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
                    </span>

                    {!loading && (
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-xs font-bold tracking-[0.18em] text-neutral-400 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    REGISTER
                  </button>
                </div>
              </form>

              {/* Bottom status */}
              <div className="mt-7 flex items-center justify-between border-t border-white/5 pt-5">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-cyan-400/60" />
                  <span className="font-mono text-[8px] tracking-widest text-neutral-600">
                    ENCRYPTED SESSION
                  </span>
                </div>

                <span className="font-mono text-[8px] tracking-widest text-neutral-700">
                  v1.0.0
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
        <p className="font-mono text-[8px] tracking-[0.35em] text-neutral-700">
          UNAUTHORIZED ACCESS IS PROHIBITED
        </p>
      </div>
    </main>
  );
}