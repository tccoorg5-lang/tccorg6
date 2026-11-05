'use client';

import React from 'react';
import { ShieldCheck, Lock, Scroll, Shield, Award, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MemberProfile } from '@/types/society';
import { formatInductionDate } from '@/lib/utils';

interface TabCodenameProps {
  profile: MemberProfile | null;
}

export function TabCodename({ profile }: TabCodenameProps) {
  const codename = profile?.codename || 'Initiate';
  const memberNumber = profile?.member_number || 'SOC-0001';
  const rank = profile?.society_rank || 'Initiate';
  const role = (profile?.society_role || 'member').toUpperCase();
  const isLegends = profile?.is_hall_of_legends || false;
  const inductionDate = formatInductionDate(profile?.induction_date);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12 select-none">
      {/* 1. Header */}
      <div className="border-b border-[#262C3A]/70 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase block font-semibold">
            Institutional Dossier &bull; Section III
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[#D8B26E] uppercase mt-1">
            Official Codename & Identity Roll
          </h1>
        </div>
        <Badge variant={isLegends ? 'gold' : 'neutral'}>
          {isLegends ? 'Legend Inductee' : 'Fellow Roll'}
        </Badge>
      </div>

      {/* 2. Visual Digital Identity Dossier Card */}
      <div className="rounded-[10px] bg-gradient-to-br from-[#1B2029] via-[#0F1218] to-[#161A22] border border-[rgba(197,160,89,0.45)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(197,160,89,0.1)] p-6 sm:p-8 relative overflow-hidden space-y-6 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
        <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
          <SocietySeal size={380} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262C3A]/80 pb-5 relative z-10">
          <div className="flex items-center gap-4">
            <SocietySeal size={60} glow />
            <div>
              <span className="font-serif-formal text-[0.625rem] font-bold tracking-[0.2em] text-[#C5A059] uppercase block">
                The Society &bull; Sovereign Identity
              </span>
              <h2 className="font-serif-formal text-2xl sm:text-3xl font-bold text-[#E9E2D3] tracking-widest uppercase">
                {codename}
              </h2>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] tracking-wider block font-semibold">
              Official Serial Identifier
            </span>
            <span className="font-mono text-sm font-bold text-[#D8B26E] tracking-widest">
              {memberNumber}
            </span>
          </div>
        </div>

        {/* Narrative Institutional Covenant */}
        <div className="p-4 rounded-[6px] bg-[#161A22]/80 border border-[#262C3A] relative z-10">
          <div className="flex items-start gap-3">
            <Scroll className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <p className="font-serif-editorial text-xs sm:text-sm leading-relaxed text-[#D5CEBF] italic">
              &ldquo;The conferred codename represents an inviolable covenant between the Fellow and The Society.
              Established under the charter of meritocratic rectitude and disciplined discretion, this pseudonym
              supersedes personal distinction to advance the higher imperatives of public welfare, lawful research,
              and institutional sovereignty.&rdquo;
            </p>
          </div>
        </div>

        {/* Read-Only Identity Attributes Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 text-xs pt-2">
          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Conferred Codename</span>
            <span className="font-serif-formal text-sm font-bold text-[#D8B26E]">{codename}</span>
          </div>

          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Serial Ledger Number</span>
            <span className="font-mono text-xs font-bold text-[#E9E2D3]">{memberNumber}</span>
          </div>

          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Institutional Rank</span>
            <Badge variant="gold">{rank}</Badge>
          </div>

          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Constitutional Role</span>
            <span className="font-serif-formal text-xs text-[#E9E2D3] uppercase tracking-wider font-bold">{role}</span>
          </div>

          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Induction Date</span>
            <span className="font-mono text-xs text-[#E9E2D3]">{inductionDate}</span>
          </div>

          <div className="p-3.5 rounded-[4px] bg-[#0F1218] border border-[#262C3A] flex items-center justify-between">
            <span className="text-[#8993A3] font-serif-formal uppercase text-[0.6875rem] font-semibold">Registry Standing</span>
            <span className="text-xs text-[#4ADE80] font-medium flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> Verified Active
            </span>
          </div>
        </div>

        {/* Security & Inviolability Notice */}
        <div className="p-4 rounded-[6px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.3)] flex items-start gap-3 relative z-10">
          <Lock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
          <div className="text-xs text-[#D5CEBF] leading-relaxed">
            <strong className="text-[#D8B26E] font-serif-formal uppercase tracking-wider block mb-0.5">
              Constitutional Notice of Immutability
            </strong>
            Official identities, member numbers, and merit points are strictly read-only and immutable.
            They are conferred and governed exclusively by Sovereign Founder authority, ratified under the High Council of The Society.
          </div>
        </div>
      </div>
    </div>
  );
}
