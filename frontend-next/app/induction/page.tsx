'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocietySeal } from '@/components/brand/society-seal';
import { api, setStoredSession } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { KeyRound, Mail, Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { InvitationVerifyResult } from '@/types/society';

export default function InductionPage() {
  const router = useRouter();

  // Step 1: Token
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenVerification, setTokenVerification] = useState<InvitationVerifyResult | null>(null);

  // Step 2: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');

  // 1. Verify Token Pre-Check
  const handleVerifyToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token.trim()) return;

    setIsVerifying(true);
    setError('');

    try {
      const res = await api.post<InvitationVerifyResult>('/invitations/verify', {
        token: token.trim(),
      });

      if (res?.valid) {
        setTokenVerification(res);
      } else {
        setTokenVerification(null);
        setError(res?.message || 'Invalid or expired invitation token');
      }
    } catch (err: any) {
      setTokenVerification(null);
      setError(err.message || 'Token verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Redeem Token & Complete Induction
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !email.trim() || !password) return;

    setIsRedeeming(true);
    setError('');

    try {
      const res = await api.post<any>('/invitations/redeem', {
        token: token.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.access_token) {
        throw new Error('Induction failed');
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
        console.warn('Supabase session sync notice', err);
      }

      // Route to Member Portal
      router.push('/member');
    } catch (err: any) {
      setError(err.message || 'Induction redemption failed');
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--midnight-black)] relative overflow-hidden">
      {/* Background Crest */}
      <div className="absolute opacity-5 pointer-events-none -right-20 -bottom-20">
        <SocietySeal size={500} />
      </div>

      <div className="max-w-md w-full society-card p-8 border border-[var(--gold-border)] relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <SocietySeal size={64} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl font-bold tracking-widest text-[var(--imperial-gold)]">
            FELLOW INDUCTION
          </h1>
          <p className="font-serif-editorial text-sm text-[var(--ivory-muted)] italic">
            Cryptographic Token Redemption & Enrollment
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-[rgba(153,27,27,0.2)] border border-[#991B1B] text-xs text-[#FCA5A5] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Token Pre-Verification Section */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
              Invitation Token
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (tokenVerification) setTokenVerification(null);
                  }}
                  placeholder="ps_..."
                  className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)] font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerifyToken()}
                disabled={!token.trim() || isVerifying}
                className="society-btn-secondary text-xs px-3 py-2 shrink-0 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
              </button>
            </div>
          </div>

          {/* Verified Token Confirmation Banner */}
          {tokenVerification && (
            <div className="p-4 rounded bg-[rgba(197,160,89,0.08)] border border-[var(--gold-border)] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-bold font-serif-formal tracking-wide">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Token Verified & Validated</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--charcoal-border)]">
                <div>
                  <span className="text-[0.625rem] text-[var(--muted-grey)] block">Conferred Codename</span>
                  <span className="font-serif-formal text-[var(--imperial-gold)] font-bold">
                    {tokenVerification.assigned_codename}
                  </span>
                </div>
                <div>
                  <span className="text-[0.625rem] text-[var(--muted-grey)] block">Initial Rank</span>
                  <span className="font-serif-formal text-[var(--ivory)]">
                    {tokenVerification.assigned_rank}
                  </span>
                </div>
              </div>
              {tokenVerification.masked_email && (
                <div className="text-[0.6875rem] text-[var(--ivory-muted)] pt-1">
                  Recipient Binding: <strong className="font-mono text-[var(--antique-gold)]">{tokenVerification.masked_email}</strong>
                </div>
              )}
            </div>
          )}

          {/* Induction Completion Form (Active once token is verified) */}
          {tokenVerification && (
            <form onSubmit={handleRedeem} className="space-y-4 pt-2 border-t border-[var(--charcoal-border)]">
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                  Intended Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Must match token's intended recipient"
                    className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                  Create Vault Passphrase
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRedeeming}
                className="society-btn-primary w-full py-3 mt-2 disabled:opacity-50"
              >
                {isRedeeming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Atomic Induction...</span>
                  </span>
                ) : (
                  <span>Ratify & Induct into Fellowship</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="pt-4 border-t border-[var(--charcoal-border)] text-center text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[var(--muted-grey)] hover:text-[var(--antique-gold)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault Access</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
