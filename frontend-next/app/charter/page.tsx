'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, Scroll, ShieldCheck, Scale, Award } from 'lucide-react';

export default function CharterPage() {
  const articles = [
    {
      roman: 'ARTICLE I',
      title: 'THE MANDATE OF PUBLIC WELFARE',
      icon: Scale,
      body: 'The Society convenes as a sovereign institutional fellowship dedicated to discovering hidden talent, fostering intellectual preeminence, and executing lawful investigations in service of public accountability. No resource, knowledge, or societal apparatus shall ever be deployed for partisan gain, personal enrichment, or unlawful transgression.',
    },
    {
      roman: 'ARTICLE II',
      title: 'THE INVIOLABILITY OF CODENAME IDENTITIES',
      icon: ShieldCheck,
      body: 'Every Fellow inducted into The Society is conferred an immutable, single-use codename. Within the walls of the Vault and across all encrypted dispatches, members shall be recognized exclusively by this title. This separation of identity serves as both shield and standard: shielding the individual from extraneous influence, and demanding a standard of intellectual rectitude unencumbered by worldly status.',
    },
    {
      roman: 'ARTICLE III',
      title: 'DISCRETION & INFORMATION SECURITY',
      icon: Scroll,
      body: 'Dispatches, operations, and investigative dossiers communicated within The Society are protected by cryptographic tokens and strict cryptographic row-level security. The disclosure of operational materials to unauthorized parties constitutes an immediate forfeiture of membership and referral to the High Council for revocation.',
    },
    {
      roman: 'ARTICLE IV',
      title: 'MERITOCRATIC PROGRESSION',
      icon: Award,
      body: 'Advancement through the societal ranks—from Initiate to Round Table Candidate—is governed strictly by verified contributions to public welfare, research excellence, and demonstrated fidelity to constitutional principles. Elevation is decreed by the Founder and ratified by the Round Table Council.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--midnight-black)] text-[var(--ivory)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Back */}
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
          <Link
            href="/member"
            className="society-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault</span>
          </Link>
          <span className="society-badge">Constitutional Document</span>
        </div>

        {/* Heading & Seal */}
        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[var(--imperial-gold)]">
            THE SOCIETY CHARTER
          </h1>
          <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
            Constitutional Principles, Discretion Oaths & Public Welfare Mandate
          </p>
        </div>

        {/* Articles */}
        <div className="space-y-6">
          {articles.map((art) => {
            const Icon = art.icon;
            return (
              <div key={art.roman} className="society-card p-6 md:p-8 space-y-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[var(--antique-gold)] shrink-0" />
                  <div>
                    <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
                      {art.roman}
                    </span>
                    <h2 className="font-serif-formal text-base md:text-lg font-bold text-[var(--imperial-gold)]">
                      {art.title}
                    </h2>
                  </div>
                </div>
                <p className="font-serif-editorial text-sm md:text-base leading-relaxed text-[var(--ivory)] pl-8 italic">
                  {art.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[0.6875rem] font-mono text-[var(--muted-grey)] tracking-widest pt-4">
          RATIFIED BY FOUNDING DECREE &bull; REPOSITORY ACCESS STRICTLY AUTHENTICATED
        </div>
      </div>
    </div>
  );
}
