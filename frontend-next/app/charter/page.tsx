'use client';

import React from 'react';
import { SocietySeal } from '@/components/brand/society-seal';
import { Badge } from '@/components/ui/badge';
import { Scroll, ShieldCheck, Scale, Award } from 'lucide-react';
import { ChamberHeader } from '@/components/navigation/chamber-header';

export default function CharterPage() {
  const articles = [
    {
      roman: 'ARTICLE I',
      title: 'THE MANDATE OF PUBLIC WELFARE & INTELLECTUAL ADVANCEMENT',
      icon: Scale,
      body: 'The Society convenes as a sovereign, non-partisan institutional fellowship dedicated to discovering hidden talent, promoting intellectual preeminence, and executing lawful public-interest investigations in service of truth and societal welfare. No resource, apparatus, or privileged knowledge belonging to The Society shall ever be deployed for private enrichment, political factionalism, or unlawful aggression.',
    },
    {
      roman: 'ARTICLE II',
      title: 'THE INVIOLABILITY OF CONFERRED PSEUDONYMITY',
      icon: ShieldCheck,
      body: 'Every Fellow inducted into The Society is conferred an immutable, single-use codename recorded in the Archival Vault. Across all encrypted dispatches, symposia, and council conclaves, members are addressed and evaluated solely under this title. This shield strips away extraneous worldly status, demanding pure meritocratic rectitude and shielding the individual from external duress.',
    },
    {
      roman: 'ARTICLE III',
      title: 'DISCRETION & CRYPTOGRAPHIC GOVERNANCE',
      icon: Scroll,
      body: 'All dispatches, investigative materials, and council records transmitted within The Society are protected by cryptographic token validation and strict server-side row-level security. The disclosure of societal materials without explicit Sovereign Founder or High Council ratification constitutes an immediate and irrevocable forfeiture of fellowship.',
    },
    {
      roman: 'ARTICLE IV',
      title: 'MERITOCRATIC PROGRESSION & INDEPENDENCE',
      icon: Award,
      body: 'Elevation through societal ranks—from Initiate to High Council Standing—is governed exclusively by verified contributions to public welfare, research rigor, and constitutional fidelity. Standing cannot be purchased, inherited, or manipulated by personal influence. It is decreed by the Founder and ratified by the Round Table.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-4 sm:p-6 md:p-12 select-none">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Intelligent Chamber Navigation Header */}
        <ChamberHeader badgeText="Constitutional Charter of 2026" badgeVariant="gold" />

        {/* Heading & Seal */}
        <div className="text-center space-y-3">
          <SocietySeal size={76} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl md:text-4xl font-bold tracking-widest text-[#D8B26E] uppercase">
            The Founding Charter
          </h1>
          <p className="font-serif-editorial text-sm md:text-base text-[#B5B5BC] italic">
            Constitutional Precedents, Discretion Oaths & Sovereign Doctrine
          </p>
        </div>

        {/* Articles Ledger */}
        <div className="space-y-6">
          {articles.map((art) => {
            const Icon = art.icon;
            return (
              <div
                key={art.roman}
                className="p-6 md:p-8 rounded-[8px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.35)] transition-all space-y-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#C5A059] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-bold block">
                      {art.roman}
                    </span>
                    <h2 className="font-serif-formal text-base md:text-lg font-bold text-[#E9E2D3]">
                      {art.title}
                    </h2>
                  </div>
                </div>
                <p className="font-serif-editorial text-sm md:text-base leading-relaxed text-[#D5CEBF] pl-12 italic">
                  {art.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-[0.6875rem] font-mono text-[#858995] tracking-widest pt-4 border-t border-[#262C3A]/40 space-y-1">
          <p>RATIFIED BY SOVEREIGN FOUNDING DECREE &bull; REPOSITORY STRICTLY AUTHENTICATED</p>
          <p className="opacity-60">All rights reserved under the 2026 Charter Protocol.</p>
        </div>
      </div>
    </div>
  );
}
