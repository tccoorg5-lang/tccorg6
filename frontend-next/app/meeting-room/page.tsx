'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, Video, Mic, Shield, Users, Radio } from 'lucide-react';

export default function MeetingRoomPage() {
  return (
    <div className="min-h-screen bg-[var(--midnight-black)] text-[var(--ivory)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
          <Link
            href="/member"
            className="society-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault</span>
          </Link>
          <span className="society-badge">Conclave Chamber</span>
        </div>

        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[var(--imperial-gold)]">
            MEETING ROOM & DELIBERATION
          </h1>
          <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
            Synchronous Deliberations, Encrypted Audio-Visual Sessions & Minutes
          </p>
        </div>

        <div className="society-card p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--charcoal)] border border-[var(--gold-border)] flex items-center justify-center mx-auto text-[var(--imperial-gold)]">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-serif-formal text-xl font-bold text-[var(--imperial-gold)]">
              Session In Standby
            </h2>
            <p className="font-serif-editorial text-sm text-[var(--ivory-muted)] italic leading-relaxed">
              Live conclaves are scheduled exclusively by the Founder or High Council.
              All audio streams are protected by end-to-point encrypted session channels with human-verified minutes.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--charcoal-border)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted-grey)] font-mono">
            <span>Next Conclave: Conclave IV</span>
            <span>Quorum Requirement: 5 Fellows</span>
            <span className="text-[#4ADE80]">Encryption: TLS 1.3 / SRTP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
