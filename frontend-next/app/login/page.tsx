'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api, setStoredSession } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { Lock, User, KeyRound, ShieldCheck, AlertCircle, ArrowRight, Shield } from 'lucide-react';

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
            description: `Welcome back, Sovereign. Central Command session authenticated.`,
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
    <div className="min-h-screen flex flex-col justify-between p-6 bg-[#080A0E] relative overflow-hidden select-none">
      {/* Background Crest Watermark & Architectural Grids */}
      <div className="absolute opacity-[0.03] pointer-events-none -right-28 -bottom-28">
        <SocietySeal size={650} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Discretion Banner */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-2 text-xs border-b border-[#262C3A]/40">
        <div className="flex items-center gap-2 text-[#858995]">
          <span className="w-2 h-2 rounded-full bg-[#C5A059]/70 animate-pulse" />
          <span className="font-serif-formal tracking-wider uppercase text-[0.6875rem]">
            Institutional Vault &bull; 2026 Protocol
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#858995] text-[0.6875rem]">
          <Link href="/charter" className="hover:text-[#C5A059] transition-colors">
            Founding Charter
          </Link>
          <span className="opacity-30">&bull;</span>
          <Link href="/legends" className="hover:text-[#C5A059] transition-colors">
            Hall of Legends
          </Link>
        </div>
      </header>

      {/* Center Authentication Dossier */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.35)] shadow-[0_16px_64px_rgba(0,0,0,0.85)] p-8 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
          {/* Emblem & Title */}
          <div className="text-center space-y-3 mb-6">
            <SocietySeal size={72} glow className="mx-auto" />
            <div className="space-y-1">
              <h1 className="font-serif-formal text-2xl font-bold tracking-[0.18em] text-[#D8B26E] uppercase">
                The Society
              </h1>
              <p className="font-serif-editorial text-xs text-[#B5B5BC] italic tracking-wide">
                Private Members&apos; Digital Fellowship &bull; Sovereign Jurisdiction
              </p>
            </div>

            {/* Entrance Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#161A22] border border-[#262C3A] rounded-[4px] mt-4">
              <button
                type="button"
                onClick={() => setMode('member')}
                className={`py-1.5 text-[0.6875rem] font-serif-formal font-semibold uppercase tracking-wider rounded-[3px] transition-all ${
                  mode === 'member'
                    ? 'bg-[#C5A059] text-[#080A0E] shadow-sm'
                    : 'text-[#858995] hover:text-[#E9E2D3]'
                }`}
              >
                Fellow Entrance
              </button>
              <button
                type="button"
                onClick={() => setMode('founder')}
                className={`py-1.5 text-[0.6875rem] font-serif-formal font-semibold uppercase tracking-wider rounded-[3px] transition-all ${
                  mode === 'founder'
                    ? 'bg-[#5C161D] text-[#E9E2D3] shadow-sm border border-[#8C232D]'
                    : 'text-[#858995] hover:text-[#E9E2D3]'
                }`}
              >
                Founder Clearance
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-[4px] bg-[#991B1B]/15 border border-[#991B1B]/50 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={mode === 'founder' ? 'Founder Codename or Master Vault Email' : 'Conferred Codename or Vault Email'}
              placeholder={mode === 'founder' ? 'e.g. Doom or master@society.org' : 'e.g. Vanguard or email@society.org'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
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
                hint="Required if multi-factor authentication is enforced on founder dossier."
              />
            )}

            <Button
              type="submit"
              variant={mode === 'founder' ? 'burgundy' : 'gold'}
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              <span>{mode === 'founder' ? 'Verify Founder Clearance' : 'Enter The Vault'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Induction Gate Link */}
          <div className="mt-6 pt-5 border-t border-[#262C3A]/60 text-center space-y-2">
            <p className="text-xs text-[#858995]">
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
        </div>
      </main>

      {/* Discretion Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-4 border-t border-[#262C3A]/40 text-[0.6875rem] text-[#858995] space-y-1">
        <p>
          Discretion &bull; Public Welfare &bull; Intellectual Development &bull; Meritocratic Standing
        </p>
        <p className="opacity-60">
          Strictly invitation-only. Unauthorized access or probing is systematically monitored and logged.
        </p>
      </footer>
    </div>
  );
}
