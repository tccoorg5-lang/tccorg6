'use client';

import React from 'react';
import { Target, Award, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export function SectionOperations() {
  const mockDirectives = [
    {
      code: 'DIR-2026-001',
      title: 'Forensic Audit of Public Infrastructure Grants',
      category: 'Public Welfare Investigation',
      status: 'Active',
      points: 250,
      submissions: 3,
    },
    {
      code: 'DIR-2026-002',
      title: 'Cryptographic Security Analysis of Open Ledger Implementations',
      category: 'Cybersecurity Research',
      status: 'In Review',
      points: 500,
      submissions: 5,
    },
    {
      code: 'DIR-2026-003',
      title: 'Scholarly Translation and Annotation of Classical Inscriptions',
      category: 'Intellectual Development',
      status: 'Active',
      points: 150,
      submissions: 1,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
            Institutional Directives
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
            Operations & Challenges
          </h1>
          <p className="text-xs text-[var(--muted-grey)] mt-0.5">
            Strategic Initiatives, Research Directives & Member Merit Progression
          </p>
        </div>

        <button type="button" className="society-btn-primary">
          <Target className="w-4 h-4" />
          <span>Launch Directive</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockDirectives.map((d) => (
          <div key={d.code} className="society-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6875rem] text-[var(--antique-gold)] font-bold">
                  {d.code}
                </span>
                <span className="inline-flex items-center gap-1 text-[0.625rem] text-[#4ADE80] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                  {d.status}
                </span>
              </div>
              <h3 className="font-serif-formal text-sm font-bold text-[var(--ivory)] leading-snug">
                {d.title}
              </h3>
              <p className="text-[0.6875rem] text-[var(--muted-grey)]">
                {d.category}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--charcoal-border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[var(--imperial-gold)] font-mono font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>+{d.points} PTS</span>
              </div>
              <span className="text-[0.6875rem] text-[var(--muted-grey)] font-mono">
                {d.submissions} Submissions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
