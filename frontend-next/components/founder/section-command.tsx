'use client';

import React from 'react';
import { Users, Activity, Trophy, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { CentralCommandMetrics } from '@/types/society';

interface SectionCommandProps {
  metrics: CentralCommandMetrics | null;
  onOpenInviteModal: () => void;
}

export function SectionCommand({ metrics, onOpenInviteModal }: SectionCommandProps) {
  const kpis = [
    {
      label: 'Total Enrolled Fellows',
      value: metrics?.total_members ?? 0,
      sub: 'Official Society Registry',
      icon: Users,
      color: 'text-[var(--imperial-gold)]',
    },
    {
      label: 'Active Inductions',
      value: metrics?.active_members ?? 0,
      sub: 'Active Vault Clearance',
      icon: Activity,
      color: 'text-[#4ADE80]',
    },
    {
      label: 'Hall of Legends',
      value: metrics?.legends_count ?? 0,
      sub: 'Distinguished Roll of Honour',
      icon: Trophy,
      color: 'text-[var(--antique-gold)]',
    },
    {
      label: 'Security Clearance Gateway',
      value: 'CLASS V',
      sub: 'Sovereign Clearance Confirmed',
      icon: ShieldAlert,
      color: 'text-[var(--imperial-gold)]',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
            Founder Clearance
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
            Central Command & Telemetry
          </h1>
          <p className="text-xs text-[var(--muted-grey)] mt-0.5">
            Real-Time Institutional Metrics & System Health
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenInviteModal}
          className="society-btn-primary"
        >
          <KeyRound className="w-4 h-4" />
          <span>Issue Cryptographic Invitation</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="society-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-serif-formal tracking-wider uppercase text-[var(--muted-grey)]">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="font-serif-formal text-3xl font-bold text-[var(--ivory)]">
                {kpi.value}
              </div>
              <div className="text-[0.6875rem] text-[var(--muted-grey)] font-mono">
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Institutional Health & Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="society-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-3">
            <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
              Infrastructure Status
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Systems Nominal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[var(--charcoal-border)]/50">
              <span className="text-[var(--muted-grey)]">FastAPI Core Authority</span>
              <span className="font-mono text-[#4ADE80]">Operational (v1.0.0)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--charcoal-border)]/50">
              <span className="text-[var(--muted-grey)]">Supabase PostgreSQL 15</span>
              <span className="font-mono text-[#4ADE80]">Connected &bull; Strict RLS Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--charcoal-border)]/50">
              <span className="text-[var(--muted-grey)]">Realtime WebSocket Hub</span>
              <span className="font-mono text-[#4ADE80]">10 events/sec throttled</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[var(--muted-grey)]">Cryptographic Vault Engine</span>
              <span className="font-mono text-[var(--imperial-gold)]">SHA-256 Single-Use Tokens</span>
            </div>
          </div>
        </div>

        <div className="society-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-3">
            <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
              Institutional Principles
            </h3>
            <span className="text-xs font-mono text-[var(--antique-gold)]">
              Charter 2026
            </span>
          </div>

          <p className="font-serif-editorial text-sm leading-relaxed text-[var(--ivory-muted)] italic">
            &ldquo;The Society convenes as an independent digital institution dedicated to discovering
            exceptional talent, promoting intellectual preeminence, and conducting lawful public-interest
            inquiries with unyielding discretion.&rdquo;
          </p>

          <div className="pt-2 border-t border-[var(--charcoal-border)] flex items-center justify-between text-xs text-[var(--muted-grey)]">
            <span>Discretion Standard: Absolute</span>
            <span className="text-[var(--antique-gold)]">Accountability to Law: Inviolable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
