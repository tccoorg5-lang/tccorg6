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
} from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
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
    <aside className="w-64 bg-[var(--obsidian)] border-r border-[var(--charcoal-border)] flex flex-col justify-between shrink-0 h-screen select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-[var(--charcoal-border)] flex items-center gap-3">
          <SocietySeal size={38} glow />
          <div className="flex flex-col">
            <span className="font-serif-formal text-[0.875rem] font-bold tracking-widest text-[var(--imperial-gold)]">
              CENTRAL COMMAND
            </span>
            <span className="text-[0.6875rem] tracking-wider text-[var(--antique-gold)] uppercase font-semibold">
              Founder Authority
            </span>
          </div>
        </div>

        {/* 5 Primary Sections */}
        <div className="p-3">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[var(--muted-grey)] px-3 mb-2">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[0.8125rem] font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[rgba(197,160,89,0.12)] text-[var(--imperial-gold)] border border-[var(--gold-border)] shadow-[0_2px_12px_rgba(197,160,89,0.1)]'
                      : 'text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--ivory)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[var(--antique-gold)]" />
                  <span className="font-serif-formal tracking-wider">{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dedicated Chambers */}
        <div className="p-3 border-t border-[var(--charcoal-border)]">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[var(--muted-grey)] px-3 mb-2">
            Dedicated Chambers
          </div>
          <nav className="space-y-0.5">
            {dedicatedPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-[0.75rem] font-medium text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--antique-gold)] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--dim-grey)]" />
                  <span>{page.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer (Switch to Member View & Logout) */}
      <div className="p-3 border-t border-[var(--charcoal-border)] flex items-center justify-between gap-2">
        <Link
          href="/member"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--charcoal)] border border-[var(--charcoal-border)] hover:border-[var(--antique-gold)] text-[0.75rem] font-medium text-[var(--ivory)] transition-all overflow-hidden"
          title="Switch to Member View"
        >
          <UserCheck className="w-3.5 h-3.5 text-[var(--antique-gold)] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[0.6875rem] font-serif-formal text-[var(--imperial-gold)] leading-tight">
              {profile?.codename || 'SOVEREIGN'}
            </span>
            <span className="text-[0.5625rem] text-[var(--muted-grey)] leading-tight">Member View</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title="Lock Vault"
          aria-label="Lock Vault"
          className="p-2 text-[var(--muted-grey)] hover:text-[var(--antique-gold)] transition-colors rounded hover:bg-[var(--charcoal)]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
