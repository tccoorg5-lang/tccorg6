'use client';

import React from 'react';
import { SocietySeal } from '@/components/brand/society-seal';
import { Badge } from '@/components/ui/badge';
import { ChamberHeader } from '@/components/navigation/chamber-header';
import { Trophy, Star, Award, Shield } from 'lucide-react';

export default function LegendsPage() {
  const legends = [
    {
      codename: 'DOOM',
      memberId: 'SOC-0001',
      title: 'FOUNDER & CHANCELLOR',
      rank: 'Founder',
      citation:
        'Established the constitutional framework, cryptographic charter, and sovereign doctrine of lawful accountability and intellectual independence.',
      conferred: 'Founding Decree',
      legacy: 'Eternal Legacy',
    },
    {
      codename: 'VERITAS',
      memberId: 'SOC-0004',
      title: 'SENIOR INVESTIGATOR',
      rank: 'Senior Fellow',
      citation:
        'Spearheaded the forensic inquiry into systemic municipal misallocations, securing public audit protections without compromising societal discretion.',
      conferred: 'Session 2025',
      legacy: 'Roll of Honour',
    },
    {
      codename: 'AEGIS',
      memberId: 'SOC-0008',
      title: 'CYBERSECURITY ARCHITECT',
      rank: 'Senior Fellow',
      citation:
        'Engineered the zero-trust cryptographic token redemption protocol and fortified institutional archives against unauthorized external surveillance.',
      conferred: 'Session 2026',
      legacy: 'Roll of Honour',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-4 sm:p-6 md:p-12 select-none society-grid-bg">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Intelligent Chamber Navigation Header */}
        <ChamberHeader badgeText="Honoris Causa • Permanent Roll" badgeVariant="gold" />

        {/* Monumental Header */}
        <div className="text-center space-y-3">
          <SocietySeal size={80} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-[#D8B26E] uppercase">
            Hall of Legends
          </h1>
          <p className="font-serif-editorial text-xs sm:text-sm md:text-base text-[#D5CEBF] italic">
            Permanent Roll of Honour &bull; Distinguished Fellows & Historic Benefactors
          </p>
        </div>

        {/* Preamble Card */}
        <div className="p-6 sm:p-8 rounded-[10px] bg-gradient-to-br from-[#161A22] via-[#0F1218] to-[#1B2029] border border-[rgba(197,160,89,0.4)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(197,160,89,0.1)] text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
          <p className="font-serif-editorial text-base sm:text-lg md:text-xl text-[#E9E2D3] italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;To those whose intellect, courage, and unyielding rectitude advanced the public welfare when all conventional avenues stood barred.&rdquo;
          </p>
          <span className="font-serif-formal text-xs text-[#D8B26E] uppercase tracking-widest mt-3.5 block font-bold">
            The High Council of The Society
          </span>
        </div>

        {/* Legends Monuments Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {legends.map((l) => (
            <div
              key={l.codename}
              className="p-6 rounded-[8px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.5)] transition-all flex flex-col justify-between space-y-5 shadow-lg relative overflow-hidden group before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059]/40 before:to-transparent hover:shadow-[0_16px_48px_rgba(197,160,89,0.12)]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif-formal text-lg font-bold text-[#D8B26E] tracking-wider group-hover:text-[#F0DBA5] transition-colors">
                      {l.codename}
                    </h2>
                    <span className="font-mono text-[0.6875rem] text-[#8993A3] block mt-0.5">
                      {l.memberId} &bull; {l.title}
                    </span>
                  </div>
                  <Badge variant="gold">{l.rank}</Badge>
                </div>

                <p className="font-serif-editorial text-xs leading-relaxed text-[#D5CEBF] italic">
                  {l.citation}
                </p>
              </div>

              <div className="pt-3 border-t border-[#262C3A]/60 flex items-center justify-between text-[0.625rem] font-mono text-[#8993A3]">
                <span>Conferred: {l.conferred}</span>
                <span className="text-[#D8B26E] font-bold">{l.legacy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
