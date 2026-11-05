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
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { InvitationVerifyResult } from '@/types/society';

export default function InductionPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Multi-step: 1 = Token Entry, 2 = Onboarding & Oath, 3 = Ratified Credential Card
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Token
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenVerification, setTokenVerification] = useState<InvitationVerifyResult | null>(null);

  // Step 2: Email, Password & Discretion Oath
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasAffirmedOath, setHasAffirmedOath] = useState(false);
  const [hasAcceptedCharter, setHasAcceptedCharter] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');

  // Step 3: Induction Success Record
  const [inductedMember, setInductedMember] = useState<any>(null);

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
        setStep(2);
        toast({
          type: 'success',
          title: 'Invitation Validated',
          description: `Cryptographic token recognized. Codename ${res.assigned_codename} ready for induction.`,
        });
      } else {
        setTokenVerification(null);
        setError(res?.message || 'Invalid or expired invitation token');
      }
    } catch (err: any) {
      setTokenVerification(null);
      setError(err.message || 'Token verification failed. Please inspect token.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Redeem Token & Complete Induction
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !email.trim() || !password) return;

    if (password !== confirmPassword) {
      setError('Vault passphrases do not match.');
      return;
    }

    if (!hasAffirmedOath || !hasAcceptedCharter) {
      setError('You must solemnly affirm the Discretion Oath and accept the Founding Charter.');
      return;
    }

    setIsRedeeming(true);
    setError('');

    try {
      const res = await api.post<any>('/invitations/redeem', {
        token: token.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.access_token) {
        throw new Error('Induction execution failed to return valid session access token.');
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

      setInductedMember({
        codename: tokenVerification?.assigned_codename || 'Fellow',
        rank: tokenVerification?.assigned_rank || 'Initiate',
        email: email.trim().toLowerCase(),
      });
      setStep(3);

      toast({
        type: 'success',
        title: 'Induction Concluded',
        description: 'You are now an officially inducted Fellow of The Society.',
      });
    } catch (err: any) {
      setError(err.message || 'Atomic induction redemption failed.');
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#080A0E] relative overflow-hidden select-none society-grid-bg">
      {/* Background Security Reticle & Geometric Lattice */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
        <SecurityLattice size={800} />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-3 text-xs border-b border-[#262C3A]/60">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
          <span className="font-serif-formal tracking-wider uppercase text-[0.6875rem] text-[#D8B26E] font-semibold">
            Gate of Induction &bull; Candidate Enrollment Protocol
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#8993A3] hover:text-[#D8B26E] transition-colors font-serif-formal uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Access Gate</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-auto py-8">
        <div className="rounded-[10px] bg-[#0F1218]/95 backdrop-blur-md border border-[rgba(197,160,89,0.35)] shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_32px_rgba(197,160,89,0.08)] p-6 sm:p-8 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
          {/* Header Title & Seal */}
          <div className="text-center space-y-2 mb-6">
            <SocietySeal size={72} glow className="mx-auto" />
            <h1 className="font-serif-formal text-xl font-bold tracking-[0.16em] text-[#D8B26E] uppercase">
              {step === 3 ? 'Credential Bestowed' : 'Fellow Induction Gate'}
            </h1>
            <p className="font-serif-editorial text-xs text-[#D5CEBF] italic">
              {step === 1 && 'Step 1: Cryptographic Token Pre-Verification'}
              {step === 2 && 'Step 2: Credential Provisioning & Solemn Oath'}
              {step === 3 && 'Induction Ratified & Recorded in Institutional Archives'}
            </p>

            {/* Stepper Progress */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span
                className={`w-8 h-1 rounded-full transition-all ${
                  step >= 1 ? 'bg-[#D8B26E]' : 'bg-[#262C3A]'
                }`}
              />
              <span
                className={`w-8 h-1 rounded-full transition-all ${
                  step >= 2 ? 'bg-[#D8B26E]' : 'bg-[#262C3A]'
                }`}
              />
              <span
                className={`w-8 h-1 rounded-full transition-all ${
                  step >= 3 ? 'bg-[#D8B26E]' : 'bg-[#262C3A]'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-[4px] bg-[#991B1B]/15 border border-[#991B1B]/50 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* STEP 1: TOKEN ENTRY */}
          {step === 1 && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <Input
                label="Invitation Cryptographic Token"
                placeholder="ps_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                hint="Provided directly by Founder authority. Single-use, time-limited token."
                required
                className="font-mono text-xs tracking-wider"
              />

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-3 py-3"
                isLoading={isVerifying}
              >
                <span>Verify Token Authority</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* STEP 2: CREDENTIAL PROVISIONING & OATH */}
          {step === 2 && tokenVerification && (
            <form onSubmit={handleRedeem} className="space-y-5">
              {/* Confirmed Token Dossier Banner */}
              <div className="p-4 rounded-[6px] bg-[#161A22] border border-[rgba(197,160,89,0.35)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-serif-formal font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Cryptographic Token Verified</span>
                  </div>
                  <Badge variant="gold">{tokenVerification.assigned_rank}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-2.5 border-t border-[#262C3A]">
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Conferred Codename
                    </span>
                    <span className="font-serif-formal text-sm text-[#D8B26E] font-bold">
                      {tokenVerification.assigned_codename}
                    </span>
                  </div>
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Bound Recipient
                    </span>
                    <span className="font-mono text-xs text-[#E9E2D3]">
                      {tokenVerification.masked_email || 'Candidate-Specific'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email & Passphrase Setup */}
              <div className="space-y-3">
                <Input
                  label="Verified Vault Email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hint="Must correspond to the email designated in this invitation."
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Create Secret Passphrase"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm Secret Passphrase"
                    type="password"
                    placeholder="Re-enter passphrase"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Solemn Discretion Oath */}
              <div className="p-4 rounded-[6px] bg-[#080A0E] border border-[#262C3A] space-y-3">
                <div className="flex items-center gap-2 text-[#D8B26E] font-serif-formal text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>The Solemn Discretion Oath</span>
                </div>
                <p className="font-serif-editorial text-xs text-[#D5CEBF] italic leading-relaxed">
                  &ldquo;I hereby solemnly affirm upon my personal honour to observe utmost discretion, safeguard the confidentiality of all dispatches, and dedicate my intellect and character to public welfare, research, and meritocratic service under The Society.&rdquo;
                </p>
                <div className="space-y-2 pt-2 border-t border-[#262C3A]/60">
                  <label className="flex items-start gap-2.5 text-xs text-[#E9E2D3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAffirmedOath}
                      onChange={(e) => setHasAffirmedOath(e.target.checked)}
                      className="mt-0.5 accent-[#C5A059] rounded"
                    />
                    <span>I solemnly affirm the Discretion Oath in its entirety.</span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-[#E9E2D3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAcceptedCharter}
                      onChange={(e) => setHasAcceptedCharter(e.target.checked)}
                      className="mt-0.5 accent-[#C5A059] rounded"
                    />
                    <span>I accept the constitutional tenets of the Founding Charter.</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isRedeeming}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="flex-1 py-3"
                  isLoading={isRedeeming}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Execute Atomic Induction</span>
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: MINTED CREDENTIAL CARD */}
          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Physical Institutional Member Dossier Card */}
              <div className="p-6 rounded-[8px] bg-gradient-to-br from-[#1B2029] via-[#0F1218] to-[#161A22] border border-[rgba(197,160,89,0.5)] shadow-[0_16px_48px_rgba(197,160,89,0.15)] text-left relative overflow-hidden space-y-4 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
                <div className="flex items-start justify-between border-b border-[#262C3A] pb-3">
                  <div>
                    <span className="font-serif-formal text-[0.625rem] font-bold text-[#C5A059] uppercase tracking-widest block">
                      The Society &bull; Sovereign Roll
                    </span>
                    <h3 className="font-serif-formal text-lg font-bold text-[#D8B26E] tracking-wider uppercase mt-0.5">
                      {inductedMember?.codename}
                    </h3>
                  </div>
                  <SocietySeal size={44} glow />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Conferred Rank
                    </span>
                    <Badge variant="gold">{inductedMember?.rank || 'Initiate'}</Badge>
                  </div>
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Induction Status
                    </span>
                    <Badge variant="active">Full Standing</Badge>
                  </div>
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Authentication
                    </span>
                    <span className="font-mono text-[0.6875rem] text-[#E9E2D3]">Ed25519 Verified</span>
                  </div>
                  <div>
                    <span className="text-[0.625rem] text-[#8993A3] uppercase block font-serif-formal">
                      Council Standing
                    </span>
                    <span className="font-serif-formal text-xs text-[#E9E2D3]">General Assembly</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#262C3A]/60 flex items-center justify-between text-[0.625rem] text-[#8993A3] font-mono">
                  <span>DISCRETION &bull; INTEGRITY &bull; MERIT</span>
                  <span>SOC-2026</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#8993A3]">
                  Your credentials have been securely registered. Proceed to your Member Chambers.
                </p>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full py-3.5"
                  onClick={() => router.push('/member')}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Member Chambers</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-[#262C3A]/60 text-[0.6875rem] text-[#8993A3]">
        <p>The Society &bull; Cryptographic Enrollment Protocol &bull; Strictly Invitation-Only</p>
      </footer>
    </div>
  );
}
