'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, Trophy, Sparkles, Star } from 'lucide-react';

export default function LegendsPage() {
  const legends = [
    {
      codename: 'SOVEREIGN',
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
      rank: 'Senior Member',
      citation:
        'Spearheaded the forensic inquiry into systemic municipal misallocations, securing public audit protections without compromising societal discretion.',
      conferred: 'Session 2025',
      legacy: 'Roll of Honour',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--midnight-black)] text-[var(--ivory)] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Back */}
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
          <Link
            href="/member"
            className="society-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault</span>
          </Link>
          <span className="society-badge bg-[rgba(216,178,110,0.15)] border-[var(--imperial-gold)] text-[var(--imperial-gold)]">
            Honoris Causa
          </span>
        </div>

        {/* Monumental Header */}
        <div className="text-center space-y-3">
          <SocietySeal size={80} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl md:text-4xl font-bold tracking-widest text-[var(--imperial-gold)]">
            HALL OF LEGENDS
          </h1>
          <p className="font-serif-editorial text-sm md:text-base text-[var(--ivory-muted)] italic">
            Permanent Roll of Honour &bull; Distinguished Fellows & Historic Benefactors
          </p>
        </div>

        {/* Preamble Card */}
        <div className="society-card p-6 text-center border-[var(--gold-border)]">
          <p className="font-serif-editorial text-base md:text-lg text-[var(--ivory)] italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;To those whose intellect, courage, and unyielding rectitude advanced the public welfare
            when all conventional avenues stood barred.&rdquo;
          </p>
        </div>

        {/* Legends Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {legends.map((l) => (
            <div key={l.codename} className="society-card p-6 md:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif-formal text-xl font-bold text-[var(--imperial-gold)] tracking-wide">
                      {l.codename}
                    </h2>
                    <span className="font-mono text-xs text-[var(--antique-gold)]">
                      {l.memberId} &bull; {l.title}
                    </span>
                  </div>
                  <span className="society-badge text-xs">
                    {l.rank}
                  </span>
                </div>

                <p className="font-serif-editorial text-sm leading-relaxed text-[var(--ivory-muted)] italic">
                  {l.citation}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--charcoal-border)] flex items-center justify-between text-xs font-mono text-[var(--muted-grey)]">
                <span>Conferred: {l.conferred}</span>
                <span className="text-[var(--antique-gold)]">{l.legacy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
