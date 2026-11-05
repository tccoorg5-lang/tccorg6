'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocietySeal } from '@/components/brand/society-seal';
import { SecurityLattice } from '@/components/brand/security-lattice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api, setStoredSession } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import {
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Shield,
  Lock,
  Cpu,
  Fingerprint,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<'member' | 'founder'>('member');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post<any>('/auth/login', {
        username: identifier.trim(),
        password,
      });

      if (!res?.access_token) {
        throw new Error('Authentication failed: Invalid credentials returned by authoritative service.');
      }

      // Store session
      setStoredSession(res);

      // Sync Supabase client session
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token,
        });
      } catch (err) {
        console.warn('Supabase session sync warning', err);
      }

      // Authoritative role verification
      try {
        const profile = await api.get<any>('/members/me');
        if (profile?.society_role === 'founder') {
          toast({
            type: 'success',
            title: 'Founder Clearance Confirmed',
            description: 'Welcome back, Sovereign. Central Command session authenticated.',
          });
          router.push('/founder');
        } else {
          if (mode === 'founder') {
            toast({
              type: 'info',
              title: 'Fellow Clearance Granted',
              description: 'Account verified as Fellow. Routing to Member Chambers.',
            });
          } else {
            toast({
              type: 'success',
              title: 'Fellow Clearance Confirmed',
              description: `Welcome back, ${profile?.codename || 'Fellow'}.`,
            });
          }
          router.push('/member');
        }
      } catch {
        router.push('/member');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid codename, vault email, or secret passphrase.');
      toast({
        type: 'error',
        title: 'Authentication Denied',
        description: err.message || 'The Society could not verify these credentials.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#080A0E] relative overflow-hidden select-none society-grid-bg">
      {/* Background Animated Security Reticle & Geometric Lattice */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <SecurityLattice size={780} />
      </div>

      {/* Top Ambient Vignette */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#C5A059]/5 via-transparent to-transparent pointer-events-none" />

      {/* Discretion & Protocol Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-3 text-xs border-b border-[#262C3A]/60">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="font-serif-formal tracking-widest uppercase text-[0.6875rem] text-[#D8B26E] font-semibold">
            Institutional Vault &bull; Zero-Trust Protocol 2026
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#8993A3] text-[0.6875rem]">
          <Link
            href="/charter"
            className="hover:text-[#D8B26E] transition-colors font-serif-formal tracking-wider uppercase"
          >
            Founding Charter
          </Link>
          <span className="opacity-30">&bull;</span>
          <Link
            href="/legends"
            className="hover:text-[#D8B26E] transition-colors font-serif-formal tracking-wider uppercase"
          >
            Hall of Legends
          </Link>
        </div>
      </header>

      {/* Center Authentication Dossier */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8 sm:py-12">
        <div className="rounded-[10px] bg-[#0F1218]/95 backdrop-blur-md border border-[rgba(197,160,89,0.35)] shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_32px_rgba(197,160,89,0.08)] p-6 sm:p-8 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
          
          {/* Institution Header & Emblem */}
          <div className="text-center space-y-3 mb-6">
            <SocietySeal size={76} glow className="mx-auto" />
            
            <div className="space-y-1">
              <h1 className="font-serif-formal text-2xl font-bold tracking-[0.2em] text-[#D8B26E] uppercase">
                The Society
              </h1>
              <p className="font-serif-editorial text-xs text-[#D5CEBF] italic tracking-wide">
                Private Cybersecurity & Intelligence Fellowship &bull; Sovereign Vault
              </p>
            </div>

            {/* Entrance Mode Switcher: Fellow vs Founder Clearance */}
            <div className="grid grid-cols-2 p-1 bg-[#161A22] border border-[#262C3A] rounded-[4px] mt-4">
              <button
                type="button"
                onClick={() => setMode('member')}
                className={`py-2 text-[0.6875rem] font-serif-formal font-semibold uppercase tracking-wider rounded-[3px] transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'member'
                    ? 'bg-gradient-to-r from-[#D8B26E] to-[#C5A059] text-[#080A0E] shadow-md font-bold'
                    : 'text-[#8993A3] hover:text-[#E9E2D3]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fellow Entrance</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('founder')}
                className={`py-2 text-[0.6875rem] font-serif-formal font-semibold uppercase tracking-wider rounded-[3px] transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'founder'
                    ? 'bg-[#5C161D] text-[#E9E2D3] shadow-md border border-[#8C232D] font-bold'
                    : 'text-[#8993A3] hover:text-[#E9E2D3]'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-[#D8B26E]" />
                <span>Founder Clearance</span>
              </button>
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-5 p-3 rounded-[4px] bg-[#991B1B]/15 border border-[#991B1B]/50 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={mode === 'founder' ? 'Founder Codename or Master Vault Email' : 'Conferred Codename or Vault Email'}
              placeholder={mode === 'founder' ? 'e.g. DOOM or master@society.org' : 'e.g. VANGUARD or email@society.org'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Secret Passphrase"
              type="password"
              placeholder="Private authentication passphrase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === 'founder' && (
              <Input
                label="Hardware / MFA Authenticator Code (Optional)"
                type="text"
                placeholder="6-digit security token"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                hint="Enforced if hardware key / TOTP anchor is active on Founder dossier."
              />
            )}

            <Button
              type="submit"
              variant={mode === 'founder' ? 'burgundy' : 'gold'}
              size="lg"
              className="w-full mt-3 py-3"
              isLoading={loading}
            >
              <span>{mode === 'founder' ? 'Verify Founder Clearance' : 'Authenticate & Enter Vault'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Induction Gate Link */}
          <div className="mt-6 pt-5 border-t border-[#262C3A]/60 text-center space-y-2">
            <p className="text-xs text-[#8993A3]">
              Possess a single-use cryptographic invitation token?
            </p>
            <Link
              href="/induction"
              className="inline-flex items-center gap-1.5 text-xs font-serif-formal font-bold tracking-wider text-[#C5A059] hover:text-[#D8B26E] uppercase transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Redeem Token at Induction Gate</span>
            </Link>
          </div>

          {/* Micro Telemetry Footer */}
          <div className="mt-4 pt-3 border-t border-[#262C3A]/40 flex items-center justify-between text-[0.625rem] font-mono text-[#8993A3]/70">
            <span>TLS 1.3 &bull; AES-256-GCM</span>
            <span className="text-[#4ADE80]">SESSION: STANDBY</span>
          </div>
        </div>
      </main>

      {/* Discretion Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-[#262C3A]/60 text-[0.6875rem] text-[#8993A3] space-y-1">
        <p className="font-serif-formal tracking-wider uppercase text-[#C5A059]/80">
          Discretion &bull; Public Welfare &bull; Intellectual Development &bull; Meritocratic Standing
        </p>
        <p className="opacity-60 text-[0.625rem] font-mono">
          Strictly invitation-only. Unauthorized probing or connection attempts are logged in the immutable security audit ledger.
        </p>
      </footer>
    </div>
  );
}
