'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  Radio,
  Landmark,
  BookOpen,
  Trophy,
  Scroll,
  Video,
  ShieldCheck,
  UserCheck,
  LogOut,
  Fingerprint,
} from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { TelemetryPill } from '@/components/brand/telemetry-pill';
import { MemberProfile } from '@/types/society';
import { clearStoredSession } from '@/lib/api';

export type FounderSection =
  | 'command'
  | 'intelligence'
  | 'operations'
  | 'communications'
  | 'governance';

interface FounderNavRailProps {
  profile: MemberProfile | null;
  activeSection: FounderSection;
  onSectionChange: (section: FounderSection) => void;
}

export function FounderNavRail({
  profile,
  activeSection,
  onSectionChange,
}: FounderNavRailProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearStoredSession();
    router.push('/login');
  };

  const navSections = [
    {
      id: 'command' as FounderSection,
      label: 'Central Command',
      icon: LayoutDashboard,
      description: 'System Telemetry & Metrics',
    },
    {
      id: 'intelligence' as FounderSection,
      label: 'Membership Intelligence',
      icon: Users,
      description: 'Roster & Token Issuance',
    },
    {
      id: 'operations' as FounderSection,
      label: 'Operations & Challenges',
      icon: Target,
      description: 'Directives & Submissions',
    },
    {
      id: 'communications' as FounderSection,
      label: 'Communications Control',
      icon: Radio,
      description: 'Channels & Broadcasts',
    },
    {
      id: 'governance' as FounderSection,
      label: 'Governance & Legacy',
      icon: Landmark,
      description: 'Charter & Audit Ledger',
    },
  ];

  const dedicatedPages = [
    { href: '/roundtable', label: 'The Round Table', icon: Landmark },
    { href: '/legends', label: 'Hall of Legends', icon: Trophy },
    { href: '/archives', label: 'Society Archives', icon: BookOpen },
    { href: '/charter', label: 'Founding Charter', icon: Scroll },
    { href: '/meeting-room', label: 'Meeting Room', icon: Video },
    { href: '/security-centre', label: 'Security Centre', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#0F1218] border-r border-[#262C3A] flex flex-col justify-between shrink-0 h-screen select-none overflow-y-auto relative z-20">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-[#262C3A] flex items-center gap-3 bg-[#080A0E]/50">
          <SocietySeal size={40} glow />
          <div className="flex flex-col">
            <span className="font-serif-formal text-[0.875rem] font-bold tracking-[0.14em] text-[#D8B26E] uppercase">
              Central Command
            </span>
            <span className="text-[0.625rem] font-mono tracking-wider text-[#C5A059] uppercase flex items-center gap-1.5 mt-0.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C161D] border border-[#D8B26E] animate-pulse" />
              Founder Authority
            </span>
          </div>
        </div>

        {/* 5 Primary Sections */}
        <div className="p-3">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[#8993A3] px-3 mb-2 font-semibold">
            Command Modules
          </div>
          <nav className="space-y-1">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSectionChange(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-[0.8125rem] font-medium transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(197,160,89,0.2)] to-[rgba(197,160,89,0.06)] text-[#D8B26E] border-l-2 border-[#D8B26E] shadow-[0_2px_16px_rgba(197,160,89,0.12)]'
                      : 'text-[#E9E2D3] hover:bg-[#161A22] hover:text-[#D8B26E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D8B26E]' : 'text-[#8993A3]'}`} />
                  <span className="font-serif-formal tracking-wider">{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dedicated Chambers */}
        <div className="p-3 border-t border-[#262C3A]">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[#8993A3] px-3 mb-2 font-semibold">
            Dedicated Chambers
          </div>
          <nav className="space-y-0.5">
            {dedicatedPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[4px] text-[0.75rem] font-medium text-[#8993A3] hover:bg-[#161A22] hover:text-[#D8B26E] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" />
                  <span>{page.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Enclave Telemetry */}
        <div className="px-4 py-2">
          <TelemetryPill variant="compact" className="w-full justify-center" />
        </div>
      </div>

      {/* Footer (Switch to Member View & Logout) */}
      <div className="p-3 border-t border-[#262C3A] bg-[#080A0E]/50 flex items-center justify-between gap-2">
        <Link
          href="/member"
          className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] hover:border-[#D8B26E] text-[0.75rem] font-medium text-[#E9E2D3] transition-all overflow-hidden"
          title="Switch to Member View"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#D8B26E] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[0.6875rem] font-serif-formal text-[#D8B26E] leading-tight font-semibold">
              {profile?.codename || 'SOVEREIGN'}
            </span>
            <span className="text-[0.5625rem] font-mono text-[#8993A3] leading-tight">Member Chambers &rarr;</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title="Lock Vault"
          aria-label="Lock Vault"
          className="p-2 text-[#8993A3] hover:text-[#EF4444] hover:bg-[#161A22] transition-colors rounded-[4px]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
