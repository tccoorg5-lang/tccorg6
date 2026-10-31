'use client';

import React from 'react';
import {
  Users,
  Activity,
  Trophy,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Radio,
  FileCheck,
  Calendar,
  AlertTriangle,
  Server,
  Database,
  Lock,
  Sparkles,
} from 'lucide-react';
import { CentralCommandMetrics } from '@/types/society';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SectionCommandProps {
  metrics: CentralCommandMetrics | null;
  onOpenInviteModal: () => void;
}

export function SectionCommand({ metrics, onOpenInviteModal }: SectionCommandProps) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalMembers = metrics?.total_members ?? 0;
  const activeMembers = metrics?.active_members ?? 0;
  const legendsCount = metrics?.legends_count ?? 0;

  const kpis = [
    {
      label: 'Total Membership',
      value: totalMembers,
      sub: 'Official Society Registry',
      icon: Users,
      badge: '+12% YTD',
      color: 'text-[#D8B26E]',
    },
    {
      label: 'Active Fellows',
      value: activeMembers,
      sub: 'In Good Standing',
      icon: Activity,
      badge: '98% Active',
      color: 'text-[#4ADE80]',
    },
    {
      label: 'Pending Invitations',
      value: 3,
      sub: 'Time-Limited Tokens',
      icon: KeyRound,
      badge: 'Single-Use',
      color: 'text-[#C5A059]',
    },
    {
      label: 'Active Operations',
      value: 4,
      sub: 'Commissioned Directives',
      icon: ShieldAlert,
      badge: 'High Priority',
      color: 'text-[#E9E2D3]',
    },
    {
      label: 'Concluded Challenges',
      value: 28,
      sub: 'Merit Points Awarded',
      icon: FileCheck,
      badge: '100% Ratified',
      color: 'text-[#4ADE80]',
    },
    {
      label: 'Hall of Legends',
      value: legendsCount,
      sub: 'Monuments Bestowed',
      icon: Trophy,
      badge: 'Highest Honor',
      color: 'text-[#D8B26E]',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 select-none">
      {/* 1. Executive Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-semibold">
              Sovereign Command &bull; Section 01
            </span>
            <Badge variant="gold">Founder Authority Active</Badge>
          </div>
          <h1 className="font-serif-formal text-2xl lg:text-3xl font-bold tracking-wider text-[#D8B26E] uppercase">
            Central Command & Executive Telemetry
          </h1>
          <p className="font-serif-editorial text-xs lg:text-sm text-[#B5B5BC] italic">
            Institutional governance, real-time membership surveillance, and operational infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-[4px] bg-[#161A22] border border-[#262C3A] text-xs font-mono text-[#C5A059]">
            <Clock className="w-3.5 h-3.5 text-[#858995]" />
            <span>{currentDate}</span>
          </div>

          <Button variant="gold" size="md" onClick={onOpenInviteModal}>
            <KeyRound className="w-4 h-4" />
            <span>Issue Cryptographic Invitation</span>
          </Button>
        </div>
      </div>

      {/* 2. Primary 6-Grid KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-[6px] bg-[#0F1218] border border-[#262C3A] space-y-3 relative overflow-hidden transition-all hover:border-[rgba(197,160,89,0.35)] hover:shadow-[0_4px_20px_rgba(197,160,89,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.625rem] font-serif-formal tracking-wider uppercase text-[#858995] font-semibold truncate">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color} shrink-0`} />
              </div>
              <div className="font-serif-formal text-3xl font-bold text-[#E9E2D3]">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between text-[0.625rem] pt-1 border-t border-[#262C3A]/50">
                <span className="text-[#858995] font-mono truncate">{kpi.sub}</span>
                <span className="text-[#C5A059] font-mono">{kpi.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Operational Timeline & Directives Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Administrative Events & Audit Feed */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Recent Administrative & Security Events</CardTitle>
                </div>
                <Badge variant="outline">Live Ledger</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif-formal font-bold text-[#D8B26E] uppercase">
                      Founder Clearance Session Authenticated
                    </span>
                    <span className="font-mono text-[0.625rem] text-[#858995]">2 mins ago</span>
                  </div>
                  <p className="text-[0.6875rem] text-[#858995]">
                    Master cryptographic token verified. Sovereign session initiated from secure hardware anchor.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif-formal font-bold text-[#E9E2D3] uppercase">
                      Cryptographic Invitation Minted
                    </span>
                    <span className="font-mono text-[0.625rem] text-[#858995]">1 hour ago</span>
                  </div>
                  <p className="text-[0.6875rem] text-[#858995]">
                    Token <strong className="font-mono text-[#C5A059]">ps_...</strong> generated for intended candidate. Bound recipient and 7-day expiry registered.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#38BDF8] mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif-formal font-bold text-[#E9E2D3] uppercase">
                      Directive Submission Ratified
                    </span>
                    <span className="font-mono text-[0.625rem] text-[#858995]">Yesterday</span>
                  </div>
                  <p className="text-[0.6875rem] text-[#858995]">
                    Candidate submission for Municipal Transparency Audit approved. 250 merit points credited.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Growth & Demographics */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Fellowship Standing Hierarchy</CardTitle>
                </div>
                <Badge variant="neutral">Meritocratic Structure</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-serif-formal">
                  <span className="text-[#858995] uppercase">Senior Fellows & Council</span>
                  <span className="font-mono text-[#D8B26E]">3 Fellows (7%)</span>
                </div>
                <div className="w-full bg-[#161A22] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C5A059] h-full rounded-full" style={{ width: '7%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-serif-formal">
                  <span className="text-[#858995] uppercase">Trusted Members & Associates</span>
                  <span className="font-mono text-[#E9E2D3]">14 Fellows (33%)</span>
                </div>
                <div className="w-full bg-[#161A22] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8C6D2D] h-full rounded-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-serif-formal">
                  <span className="text-[#858995] uppercase">Initiates & Active Candidates</span>
                  <span className="font-mono text-[#858995]">25 Fellows (60%)</span>
                </div>
                <div className="w-full bg-[#161A22] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#262C3A] h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Infrastructure & System Health Overview */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="gold">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Infrastructure Telemetry</CardTitle>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] font-medium font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  NOMINAL
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#E9E2D3]">
                  <Server className="w-4 h-4 text-[#C5A059]" />
                  <span>Next.js 16 Web Service</span>
                </div>
                <span className="font-mono text-[#4ADE80]">Operational (Render Node)</span>
              </div>

              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#E9E2D3]">
                  <Database className="w-4 h-4 text-[#C5A059]" />
                  <span>FastAPI Core Authority</span>
                </div>
                <span className="font-mono text-[#4ADE80]">Operational (Python ASGI)</span>
              </div>

              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#E9E2D3]">
                  <Lock className="w-4 h-4 text-[#C5A059]" />
                  <span>Supabase RLS & Storage</span>
                </div>
                <span className="font-mono text-[#4ADE80]">Strict RLS Active</span>
              </div>

              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#E9E2D3]">
                  <Radio className="w-4 h-4 text-[#C5A059]" />
                  <span>Realtime WebSocket Gateway</span>
                </div>
                <span className="font-mono text-[#4ADE80]">Throttled 10/s</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals Standby */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Pending Approvals</CardTitle>
                </div>
                <Badge variant="pending">2 Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif-formal font-bold text-[#E9E2D3]">Vanguard &bull; Rank Elevation</div>
                  <div className="text-[0.6875rem] text-[#858995]">Initiate &rarr; Associate Fellow</div>
                </div>
                <Button variant="gold" size="sm">
                  Review
                </Button>
              </div>

              <div className="p-3 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between text-xs">
                <div>
                  <div className="font-serif-formal font-bold text-[#E9E2D3]">Directive #002 Submission</div>
                  <div className="text-[0.6875rem] text-[#858995]">Open-Source Security Audit</div>
                </div>
                <Button variant="gold" size="sm">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
