'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocietySeal } from '@/components/brand/society-seal';
import { api, setStoredSession } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { Lock, User, KeyRound, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post<any>('/auth/login', {
        username: username.trim(),
        password,
      });

      if (!res?.access_token) {
        throw new Error('Authentication failed');
      }

      // Store session
      setStoredSession(res);

      // Sync Supabase client session if available
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token,
        });
      } catch (err) {
        console.warn('Supabase session sync warning', err);
      }

      // Check role to route appropriately
      try {
        const profile = await api.get<any>('/members/me');
        if (profile?.society_role === 'founder') {
          router.push('/founder');
        } else {
          router.push('/member');
        }
      } catch {
        router.push('/member');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid codename or credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--midnight-black)] relative overflow-hidden">
      {/* Background Crest Watermark */}
      <div className="absolute opacity-5 pointer-events-none -right-20 -bottom-20">
        <SocietySeal size={500} />
      </div>

      <div className="max-w-md w-full society-card p-8 border border-[var(--gold-border)] relative z-10 space-y-6">
        {/* Emblem & Header */}
        <div className="text-center space-y-3">
          <SocietySeal size={64} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl font-bold tracking-widest text-[var(--imperial-gold)]">
            THE SOCIETY
          </h1>
          <p className="font-serif-editorial text-sm text-[var(--ivory-muted)] italic">
            Private Institutional Fellowship &bull; Discreet Access
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-[rgba(153,27,27,0.2)] border border-[#991B1B] text-xs text-[#FCA5A5] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
              Codename or Vault Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Conferred Codename"
                className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vault Passphrase"
                className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="society-btn-primary w-full py-3 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Credentials...</span>
              </span>
            ) : (
              <span>Enter Vault</span>
            )}
          </button>
        </form>

        {/* Invitation Link */}
        <div className="pt-4 border-t border-[var(--charcoal-border)] text-center text-xs">
          <span className="text-[var(--muted-grey)]">Possess an invitation token? </span>
          <Link
            href="/induction"
            className="text-[var(--antique-gold)] font-serif-formal tracking-wide font-semibold hover:text-[var(--imperial-gold)] underline"
          >
            Induct Here
          </Link>
        </div>
      </div>
    </div>
  );
}
