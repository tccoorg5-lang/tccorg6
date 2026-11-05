'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Award,
  Calendar,
  Key,
  Star,
  Sparkles,
  Trophy,
  Bell,
  Clock,
  Radio,
  ExternalLink,
  CheckCircle2,
  Lock,
  Activity,
  Cpu,
  Layers,
} from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { TelemetryPill } from '@/components/brand/telemetry-pill';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  const memberNumber = profile?.member_number || 'SOC-0001';
  const isLegends = profile?.is_hall_of_legends || false;
  const inductionDate = formatInductionDate(profile?.induction_date);

  // Progression calculation: 1000 points per tier
  const tierTarget = 1000;
  const currentTierPoints = points % tierTarget;
  const progressPercent = Math.min(100, Math.max(15, (currentTierPoints / tierTarget) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12 select-none">
      {/* 1. Header Welcome Dossier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[0.6875rem] font-serif-formal tracking-widest uppercase text-[#C5A059] font-semibold">
              Institutional Fellow Dossier &bull; Official Record
            </span>
            <Badge variant="active">Active Fellowship</Badge>
          </div>
          <h1 className="font-serif-formal text-2xl md:text-3xl font-bold tracking-wider text-[#D8B26E] uppercase">
            Welcome, {codename}
          </h1>
          <p className="font-serif-editorial text-xs md:text-sm text-[#D5CEBF] italic">
            Standing verified under the Founding Charter. All privileges and responsibilities in effect.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] text-xs font-mono text-[#D8B26E]">
            <Clock className="w-3.5 h-3.5 text-[#8993A3]" />
            <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <Link
            href="/notifications"
            className="relative p-2 rounded-[4px] bg-[#161A22] border border-[#262C3A] text-[#C5A059] hover:text-[#D8B26E] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8B26E] absolute top-1.5 right-1.5 animate-pulse" />
          </Link>
        </div>
      </div>

      {/* 2. Physical Member Identity Card & Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Physical Metal/Obsidian Identity Card */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="rounded-[10px] bg-gradient-to-br from-[#1B2029] via-[#0F1218] to-[#161A22] border border-[rgba(197,160,89,0.45)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(197,160,89,0.1)] p-6 relative overflow-hidden space-y-6 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
            {/* Watermark Crest */}
            <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
              <SocietySeal size={280} />
            </div>

            {/* Card Top: Seal & Institution Title */}
            <div className="flex items-start justify-between relative z-10 border-b border-[#262C3A]/80 pb-4">
              <div className="flex items-center gap-3">
                <SocietySeal size={48} glow />
                <div>
                  <span className="font-serif-formal text-[0.625rem] font-bold tracking-[0.2em] text-[#C5A059] uppercase block">
                    The Society
                  </span>
                  <span className="font-serif-formal text-sm font-bold text-[#E9E2D3] tracking-wider uppercase">
                    Institutional Fellowship
                  </span>
                </div>
              </div>
              <Link href="/legends">
                <Badge variant={isLegends ? 'gold' : 'neutral'} className="cursor-pointer hover:border-[#D8B26E] transition-colors">
                  {isLegends ? 'Hall of Legends ↗' : 'Sovereign Roll ↗'}
                </Badge>
              </Link>
            </div>

            {/* Card Center: Member Name & Number */}
            <div className="relative z-10 space-y-1.5">
              <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] tracking-widest block font-semibold">
                Conferred Pseudonym
              </span>
              <div className="font-serif-formal text-2xl font-bold tracking-widest text-[#D8B26E] uppercase">
                {codename}
              </div>
              <div className="flex items-center gap-3 font-mono text-xs text-[#E9E2D3]">
                <span className="text-[#8993A3]">SERIAL NO:</span>
                <span className="tracking-widest text-[#C5A059] font-bold">{memberNumber}</span>
              </div>
            </div>

            {/* Card Attributes Grid */}
            <div className="grid grid-cols-2 gap-4 relative z-10 pt-3 border-t border-[#262C3A]/80 text-xs">
              <div>
                <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] block tracking-wider font-semibold">
                  Official Rank
                </span>
                <span className="font-serif-formal text-xs font-bold text-[#E9E2D3] uppercase mt-0.5 block">
                  {rank}
                </span>
              </div>
              <div>
                <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] block tracking-wider font-semibold">
                  Induction Date
                </span>
                <span className="font-mono text-xs text-[#E9E2D3] mt-0.5 block">
                  {inductionDate}
                </span>
              </div>
              <div>
                <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] block tracking-wider font-semibold">
                  Standing
                </span>
                <span className="text-xs text-[#4ADE80] font-medium flex items-center gap-1.5 mt-0.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> Full Rights
                </span>
              </div>
              <div>
                <span className="text-[0.625rem] font-serif-formal uppercase text-[#8993A3] block tracking-wider font-semibold">
                  Security Clearance
                </span>
                <span className="font-mono text-xs text-[#C5A059] mt-0.5 block font-bold">
                  CLASS IV &bull; VERIFIED
                </span>
              </div>
            </div>

            {/* Card Microprint Security Footer */}
            <div className="pt-3 border-t border-[#262C3A]/80 flex items-center justify-between text-[0.625rem] text-[#8993A3] font-mono relative z-10">
              <span className="tracking-widest">DISCRETION &bull; MERIT &bull; HONOR</span>
              <span className="text-[#C5A059] opacity-80">ED25519-SIG // 2026</span>
            </div>
          </div>
        </div>

        {/* Right: Progression & Metrics */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {/* Progression Gauge Card */}
          <Card variant="gold">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[0.625rem] font-serif-formal tracking-widest text-[#8993A3] uppercase font-semibold">
                    Merit Progression Track
                  </span>
                  <CardTitle className="mt-0.5">Tier {level} &bull; {rank}</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-[0.625rem] font-serif-formal tracking-widest text-[#8993A3] uppercase font-semibold">
                    Total Merit Score
                  </span>
                  <div className="font-mono text-lg font-bold text-[#D8B26E]">
                    {points.toLocaleString()} <span className="text-xs text-[#8993A3]">PTS</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full bg-[#161A22] h-2.5 rounded-full overflow-hidden border border-[#262C3A] p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#8C6D2D] via-[#C5A059] to-[#F0DBA5] shadow-[0_0_8px_rgba(216,178,110,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.6875rem] text-[#8993A3] font-mono">
                <span>Tier Milestone: {currentTierPoints} / {tierTarget} XP</span>
                <span className="text-[#D8B26E]">Next Promotion: High Council Review</span>
              </div>
            </CardContent>
          </Card>

          {/* 4 Core Metric KPI Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-[6px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.35)] transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-[#C5A059]">
                <Trophy className="w-3.5 h-3.5" />
                <span className="font-serif-formal text-[0.625rem] uppercase tracking-wider text-[#8993A3] font-semibold">
                  Leaderboard
                </span>
              </div>
              <div className="font-mono text-base font-bold text-[#E9E2D3]">Top 10%</div>
              <div className="text-[0.625rem] text-[#8993A3] font-mono">Active Fellowship</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.35)] transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-[#C5A059]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="font-serif-formal text-[0.625rem] uppercase tracking-wider text-[#8993A3] font-semibold">
                  Challenges
                </span>
              </div>
              <div className="font-mono text-base font-bold text-[#E9E2D3]">14 Concluded</div>
              <div className="text-[0.625rem] text-[#8993A3] font-mono">100% Ratified</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.35)] transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-[#C5A059]">
                <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="font-serif-formal text-[0.625rem] uppercase tracking-wider text-[#8993A3] font-semibold">
                  Dispatches
                </span>
              </div>
              <div className="font-mono text-base font-bold text-[#E9E2D3]">86 Delivered</div>
              <div className="text-[0.625rem] text-[#8993A3] font-mono">Encrypted Stream</div>
            </div>

            <Link
              href="/legends"
              className="p-4 rounded-[6px] bg-[#0F1218] border border-[#262C3A] space-y-1 block hover:border-[#D8B26E] hover:shadow-[0_4px_16px_rgba(216,178,110,0.15)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#C5A059]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#D8B26E]" />
                  <span className="font-serif-formal text-[0.625rem] uppercase tracking-wider text-[#8993A3] group-hover:text-[#D8B26E] transition-colors font-semibold">
                    Hall of Legends
                  </span>
                </div>
                <span className="text-[0.625rem] text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
              <div className="font-serif-formal text-base font-bold text-[#D8B26E]">
                {isLegends ? 'Legend' : 'Roll of Honour'}
              </div>
              <div className="text-[0.625rem] text-[#8993A3]">View Monuments →</div>
            </Link>
          </div>

          {/* Real-time Session Enclave Telemetry */}
          <TelemetryPill variant="expanded" />
        </div>
      </div>

      {/* 3. Operational Directives & Upcoming Conclaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Challenges & Directives */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C5A059]" />
                <CardTitle>Commissioned Operations & Directives</CardTitle>
              </div>
              <Badge variant="gold">3 Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-serif-formal text-xs font-bold text-[#E9E2D3] tracking-wide">
                  Operation Sovereign Audit &bull; Public Welfare
                </div>
                <p className="text-[0.6875rem] text-[#8993A3] leading-relaxed">
                  Synthesize open-source fiscal transparency metrics across three municipal councils.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[0.625rem] text-[#8993A3] font-mono">
                  <span>CLEARANCE: FELLOW</span>
                  <span>&bull;</span>
                  <span className="text-[#D8B26E] font-bold">REWARD: 250 PTS</span>
                </div>
              </div>
              <Badge variant="pending">In Progress</Badge>
            </div>

            <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-serif-formal text-xs font-bold text-[#E9E2D3] tracking-wide">
                  Cybersecurity Research &bull; Threat Intelligence
                </div>
                <p className="text-[0.6875rem] text-[#8993A3] leading-relaxed">
                  Submit technical vulnerability disclosure review for institutional archive resilience.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[0.625rem] text-[#8993A3] font-mono">
                  <span>CLEARANCE: SPECIALIST</span>
                  <span>&bull;</span>
                  <span className="text-[#D8B26E] font-bold">REWARD: 400 PTS</span>
                </div>
              </div>
              <Badge variant="pending">Under Review</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Conclaves & Announcements */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#C5A059]" />
                <CardTitle>Conclaves & Sovereign Decrees</CardTitle>
              </div>
              <Badge variant="neutral">Synchronized</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-serif-formal text-xs font-bold text-[#D8B26E] uppercase">
                  Founder Decree #04 &bull; 2026 Architecture
                </span>
                <span className="font-mono text-[0.625rem] text-[#8993A3]">Today</span>
              </div>
              <p className="text-[0.6875rem] text-[#D5CEBF] leading-relaxed">
                The Society has completed full technological elevation to 2026 Next.js & FastAPI standards. Discretion protocols and atomic invitation redemption are now enforced across all chambers.
              </p>
            </div>

            <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-serif-formal text-xs font-bold text-[#E9E2D3] uppercase">
                  General Conclave &bull; Q4 Review
                </span>
                <span className="font-mono text-[0.625rem] text-[#D8B26E]">Sunday, 20:00 UTC</span>
              </div>
              <p className="text-[0.6875rem] text-[#8993A3] leading-relaxed">
                Synchronous assembly in the Meeting Room. Quorum verification and meritocratic promotions review.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
