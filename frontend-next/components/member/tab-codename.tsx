'use client';

import React from 'react';
import { ShieldCheck, Lock, Scroll, AlertCircle } from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { MemberProfile } from '@/types/society';

interface TabCodenameProps {
  profile: MemberProfile | null;
}

export function TabCodename({ profile }: TabCodenameProps) {
  const codename = profile?.codename || 'Initiate';
  const memberNumber = profile?.member_number || 'SOC-PENDING';
  const rank = profile?.society_rank || 'Initiate';
  const role = (profile?.society_role || 'member').toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="society-card p-8 border border-[var(--charcoal-border)] relative overflow-hidden">
        {/* Subtle background crest */}
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <SocietySeal size={260} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
            <div>
              <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
                Formal Identity Dossier
              </span>
              <h1 className="font-serif-formal text-3xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
                {codename}
              </h1>
            </div>
            <SocietySeal size={56} glow />
          </div>

          {/* Narrative Covenant */}
          <div className="p-4 rounded-[var(--radius-sm)] bg-[rgba(15,18,24,0.7)] border border-[var(--charcoal-border)]">
            <div className="flex items-start gap-3">
              <Scroll className="w-5 h-5 text-[var(--antique-gold)] shrink-0 mt-0.5" />
              <p className="font-serif-editorial text-sm leading-relaxed text-[var(--ivory)] italic">
                &ldquo;The conferred codename represents a solemn covenant between the Fellow and The Society.
                Established under the charter of meritocratic rectitude and disciplined discretion, this pseudonym
                supersedes personal distinction to advance the higher imperatives of public welfare, lawful research,
                and institutional sovereignty.&rdquo;
              </p>
            </div>
          </div>

          {/* Formal Attribute Ledger */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--charcoal-border)] text-sm">
              <span className="text-[var(--muted-grey)] font-medium">Official Codename</span>
              <span className="font-serif-formal text-[var(--imperial-gold)] font-bold tracking-wide">
                {codename}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--charcoal-border)] text-sm">
              <span className="text-[var(--muted-grey)] font-medium">Member Identifier</span>
              <span className="font-mono text-[var(--ivory)] font-bold tracking-wider">
                {memberNumber}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--charcoal-border)] text-sm">
              <span className="text-[var(--muted-grey)] font-medium">Societal Rank</span>
              <span className="society-badge text-xs">
                {rank}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--charcoal-border)] text-sm">
              <span className="text-[var(--muted-grey)] font-medium">Constitutional Role</span>
              <span className="font-serif-formal text-xs text-[var(--ivory-muted)] tracking-wider">
                {role}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--charcoal-border)] text-sm">
              <span className="text-[var(--muted-grey)] font-medium">Registry Standing</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                Active &bull; Verified
              </span>
            </div>
          </div>

          {/* Constitutional Inviolability Notice */}
          <div className="p-4 rounded-[var(--radius-sm)] bg-[rgba(197,160,89,0.06)] border border-[var(--gold-border)] flex items-start gap-3">
            <Lock className="w-4 h-4 text-[var(--antique-gold)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--ivory-muted)] leading-relaxed">
              <strong className="text-[var(--antique-gold)]">Constitutional Notice of Inviolability:</strong> Official
              codenames, numbers, and merit points are strictly immutable. They cannot be altered by ordinary members
              and are decreed solely by Founder authority ratified by the High Council.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
