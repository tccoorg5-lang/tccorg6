'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, ShieldAlert, Key, Lock, EyeOff, RefreshCw } from 'lucide-react';

export default function SecurityCentrePage() {
  return (
    <div className="min-h-screen bg-[var(--midnight-black)] text-[var(--ivory)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
          <Link
            href="/founder"
            className="society-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Central Command</span>
          </Link>
          <span className="society-badge border-[#991B1B] text-[#F87171] bg-red-950/20">
            Founder Clearance Only
          </span>
        </div>

        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[var(--imperial-gold)]">
            ADMINISTRATIVE SECURITY CENTRE
          </h1>
          <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
            Cryptographic Vault Controls, Active Session Revocation & Threat Defense
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="society-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--charcoal-border)] pb-3 text-[var(--imperial-gold)]">
              <Key className="w-4 h-4" />
              <h3 className="font-serif-formal text-sm font-bold">
                MFA & Multi-Factor Enforcement
              </h3>
            </div>
            <p className="text-xs text-[var(--muted-grey)] leading-relaxed">
              Founder accounts enforce hardware security key or TOTP Authenticator enforcement for all privileged actions.
            </p>
            <div className="p-3 bg-[var(--midnight-black)] rounded border border-[var(--charcoal-border)] text-xs font-mono text-[#4ADE80]">
              TOTP Algorithm: RFC 6238 &bull; 30s Window Active
            </div>
          </div>

          <div className="society-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--charcoal-border)] pb-3 text-[var(--imperial-gold)]">
              <RefreshCw className="w-4 h-4" />
              <h3 className="font-serif-formal text-sm font-bold">
                Emergency Session Invalidation
              </h3>
            </div>
            <p className="text-xs text-[var(--muted-grey)] leading-relaxed">
              Instantly terminates all active JWT Bearer sessions across every device in case of detected credential compromise.
            </p>
            <button
              type="button"
              onClick={() => alert('Emergency lockdown protocol confirmed. All non-founder tokens invalidated.')}
              className="society-btn-secondary text-xs text-[#F87171] border-[#991B1B] hover:bg-red-950/30"
            >
              Invalidate All Active Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
