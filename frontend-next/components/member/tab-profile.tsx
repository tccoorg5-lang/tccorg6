'use client';

import React from 'react';
import { Shield, Award, Calendar, Key, Star, Sparkles } from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { MemberProfile } from '@/types/society';
import { formatInductionDate } from '@/lib/utils';

interface TabProfileProps {
  profile: MemberProfile | null;
}

export function TabProfile({ profile }: TabProfileProps) {
  const points = profile?.points || 0;
  const level = profile?.progression_level || 1;
  const rank = profile?.society_rank || 'Initiate';
  const codename = profile?.codename || 'Initiate';
  const memberNumber = profile?.member_number || 'SOC-PENDING';
  const isLegends = profile?.is_hall_of_legends || false;
  const inductionDate = formatInductionDate(profile?.induction_date);

  // Calculate progression percentage toward next thousand
  const progressPercent = Math.min(100, Math.max(12, (points % 1000) / 10));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Hero Identity Card */}
      <div className="society-card p-8 border border-[var(--charcoal-border)] relative overflow-hidden">
        {/* Subtle background crest watermark */}
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
          <SocietySeal size={280} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <SocietySeal size={72} glow />
              {isLegends && (
                <div className="absolute -top-1 -right-1 bg-[var(--antique-gold)] text-[var(--midnight-black)] p-1 rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="font-serif-formal text-2xl md:text-3xl font-bold tracking-wider text-[var(--imperial-gold)]">
                  {codename}
                </h1>
                {isLegends && (
                  <span className="society-badge bg-[rgba(216,178,110,0.18)] text-[var(--imperial-gold)] border-[var(--imperial-gold)]">
                    Hall of Legends
                  </span>
                )}
              </div>
              <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
                {profile?.designation || 'Conferred Fellow of the Society'}
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-[var(--antique-gold)]">
                <span className="text-[var(--muted-grey)]">MEMBER IDENTIFIER:</span>
                <strong className="tracking-widest">{memberNumber}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="society-badge text-xs px-3 py-1">
              {rank}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.6875rem] font-medium rounded-full bg-[rgba(46,125,50,0.15)] text-[#4ADE80] border border-[rgba(46,125,50,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              In Good Standing
            </span>
          </div>
        </div>
      </div>

      {/* Progression Track */}
      <div className="society-card p-6 border border-[var(--charcoal-border)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--muted-grey)] uppercase">
              Institutional Standing
            </span>
            <div className="font-serif-formal text-lg text-[var(--imperial-gold)] font-bold mt-0.5">
              Level {level} &bull; {rank} Track
            </div>
          </div>
          <div className="text-right">
            <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--muted-grey)] uppercase">
              Honorific Merit Points
            </span>
            <div className="font-mono text-xl text-[var(--ivory)] font-bold mt-0.5">
              {points.toLocaleString()} <span className="text-xs text-[var(--antique-gold)]">PTS</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--charcoal)] h-2.5 rounded-full overflow-hidden border border-[var(--charcoal-border)] p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#8C6D2D] via-[#C5A059] to-[#E6CA85]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[0.6875rem] text-[var(--muted-grey)] mt-2.5 font-mono">
          <span>Current Tier Standing</span>
          <span className="text-[var(--antique-gold)]">Next Elevation: Council Review</span>
        </div>
      </div>

      {/* Statistics & Achievement Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="society-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--antique-gold)] mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-[0.6875rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
              Induction Date
            </span>
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-[var(--ivory)]">
              {inductionDate}
            </div>
            <div className="text-[0.625rem] text-[var(--muted-grey)] mt-1">Official Registry Record</div>
          </div>
        </div>

        <div className="society-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--antique-gold)] mb-2">
            <Award className="w-4 h-4" />
            <span className="text-[0.6875rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
              Directives
            </span>
          </div>
          <div>
            <div className="font-serif-formal text-sm font-semibold text-[var(--ivory)]">
              Active Duty
            </div>
            <div className="text-[0.625rem] text-[var(--muted-grey)] mt-1">Public Welfare Operations</div>
          </div>
        </div>

        <div className="society-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#4ADE80] mb-2">
            <Key className="w-4 h-4" />
            <span className="text-[0.6875rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
              Clearance Level
            </span>
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-[#4ADE80]">
              CLASS IV
            </div>
            <div className="text-[0.625rem] text-[var(--muted-grey)] mt-1">Encrypted Dispatches Authorized</div>
          </div>
        </div>

        <div className="society-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--imperial-gold)] mb-2">
            <Star className="w-4 h-4" />
            <span className="text-[0.6875rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
              Roll of Honour
            </span>
          </div>
          <div>
            <div className="font-serif-formal text-sm font-semibold text-[var(--imperial-gold)]">
              {isLegends ? 'Inducted Legend' : 'Nomination Track'}
            </div>
            <div className="text-[0.625rem] text-[var(--muted-grey)] mt-1">Annual Conclave Ratification</div>
          </div>
        </div>
      </div>
    </div>
  );
}
