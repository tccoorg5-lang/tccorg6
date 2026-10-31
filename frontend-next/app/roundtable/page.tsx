'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, Landmark, Users, CheckCircle2, FileText } from 'lucide-react';

export default function RoundTablePage() {
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
          <span className="society-badge border-[var(--imperial-gold)] text-[var(--imperial-gold)]">
            High Council Chamber
          </span>
        </div>

        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[var(--imperial-gold)]">
            THE ROUND TABLE
          </h1>
          <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
            Deliberative Council &bull; Strategic Symposia & Quorum Governance
          </p>
        </div>

        {/* Current Session Card */}
        <div className="society-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-4">
            <div>
              <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
                Current Conclave Session
              </span>
              <h2 className="font-serif-formal text-lg md:text-xl font-bold text-[var(--imperial-gold)] mt-0.5">
                Conclave IV: Public Oversight Directives
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(46,125,50,0.15)] text-[#4ADE80] border border-[rgba(46,125,50,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Quorum Achieved
            </span>
          </div>

          <p className="font-serif-editorial text-base leading-relaxed text-[var(--ivory-muted)] italic">
            The Round Table convenes senior fellows and council members to deliberate upon societal strategy,
            evaluate public accountability investigations, and ratify rank elevations. Decisions are taken under
            parliamentary decorum with recorded roll-call.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[var(--charcoal)] rounded border border-[var(--charcoal-border)] space-y-1">
              <span className="text-[0.625rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
                Active Councilors
              </span>
              <div className="font-serif-formal text-xl font-bold text-[var(--ivory)]">
                7 Fellows
              </div>
            </div>
            <div className="p-4 bg-[var(--charcoal)] rounded border border-[var(--charcoal-border)] space-y-1">
              <span className="text-[0.625rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
                Pending Directives
              </span>
              <div className="font-serif-formal text-xl font-bold text-[var(--imperial-gold)]">
                2 Resolutions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
