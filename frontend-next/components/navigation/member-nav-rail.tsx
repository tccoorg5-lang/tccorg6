'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MessageSquare,
  Shield,
  ShieldAlert,
  LogOut,
  Trophy,
  Landmark,
  Scroll,
  BookOpen,
} from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { MemberProfile } from '@/types/society';
import { clearStoredSession } from '@/lib/api';

interface MemberNavRailProps {
  profile: MemberProfile | null;
  unreadCount?: number;
  activeTab: 'profile' | 'communications' | 'codename';
  onTabChange: (tab: 'profile' | 'communications' | 'codename') => void;
}

export function MemberNavRail({
  profile,
  unreadCount = 0,
  activeTab,
  onTabChange,
}: MemberNavRailProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearStoredSession();
    router.push('/login');
  };

  const isFounder = profile?.society_role === 'founder';

  const dedicatedChambers = [
    { href: '/legends', label: 'Hall of Legends', icon: Trophy },
    { href: '/roundtable', label: 'The Round Table', icon: Landmark },
    { href: '/charter', label: 'Founding Charter', icon: Scroll },
    { href: '/archives', label: 'Archives', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-[var(--obsidian)] border-r border-[var(--charcoal-border)] flex flex-col justify-between shrink-0 h-screen select-none overflow-y-auto">
      <div>
        {/* Institutional Emblem & Brand Header */}
        <div className="p-5 border-b border-[var(--charcoal-border)] flex items-center gap-3">
          <SocietySeal size={38} glow />
          <div className="flex flex-col">
            <span className="font-serif-formal text-[0.875rem] font-bold tracking-widest text-[var(--imperial-gold)]">
              THE SOCIETY
            </span>
            <span className="text-[0.6875rem] tracking-wider text-[var(--muted-grey)] uppercase">
              Fellow Access
            </span>
          </div>
        </div>

        {/* 3 Primary Navigation Tabs */}
        <nav className="p-3 space-y-1">
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[var(--radius-sm)] text-[0.8125rem] font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[rgba(197,160,89,0.12)] text-[var(--imperial-gold)] border border-[var(--gold-border)] shadow-[0_2px_12px_rgba(197,160,89,0.1)]'
                : 'text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--ivory)]'
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-[var(--antique-gold)]" />
            <span className="font-serif-formal tracking-wider">My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('communications')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[var(--radius-sm)] text-[0.8125rem] font-medium transition-all ${
              activeTab === 'communications'
                ? 'bg-[rgba(197,160,89,0.12)] text-[var(--imperial-gold)] border border-[var(--gold-border)] shadow-[0_2px_12px_rgba(197,160,89,0.1)]'
                : 'text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--ivory)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0 text-[var(--antique-gold)]" />
              <span className="font-serif-formal tracking-wider">Communications</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[0.625rem] font-bold rounded-full bg-[var(--antique-gold)] text-[var(--midnight-black)]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('codename')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[var(--radius-sm)] text-[0.8125rem] font-medium transition-all ${
              activeTab === 'codename'
                ? 'bg-[rgba(197,160,89,0.12)] text-[var(--imperial-gold)] border border-[var(--gold-border)] shadow-[0_2px_12px_rgba(197,160,89,0.1)]'
                : 'text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--ivory)]'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0 text-[var(--antique-gold)]" />
            <span className="font-serif-formal tracking-wider">Codename</span>
          </button>

          {/* Founder Central Command Shortcut (only visible if user is founder) */}
          {isFounder && (
            <div className="pt-3 mt-3 border-t border-[var(--charcoal-border)]">
              <Link
                href="/founder"
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[var(--radius-sm)] text-[0.8125rem] font-medium text-[var(--imperial-gold)] bg-[rgba(92,22,29,0.25)] border border-[var(--gold-border)] hover:bg-[rgba(92,22,29,0.45)] transition-all"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-[var(--imperial-gold)]" />
                <span className="font-serif-formal tracking-wider font-semibold">Central Command</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Dedicated Chambers & Rolls */}
        <div className="p-3 border-t border-[var(--charcoal-border)]">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[var(--muted-grey)] px-3 mb-2">
            Chambers & Rolls
          </div>
          <nav className="space-y-0.5">
            {dedicatedChambers.map((ch) => {
              const Icon = ch.icon;
              return (
                <Link
                  key={ch.href}
                  href={ch.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-[0.75rem] font-medium text-[var(--ivory-muted)] hover:bg-[var(--charcoal)] hover:text-[var(--antique-gold)] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--antique-gold)]" />
                  <span>{ch.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Rail Footer (Member Pill & Logout) */}
      <div className="p-3 border-t border-[var(--charcoal-border)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--charcoal-light)] border border-[var(--gold-border)] flex items-center justify-center font-serif-formal text-[0.875rem] font-bold text-[var(--imperial-gold)] shrink-0">
            {profile?.codename ? profile.codename[0].toUpperCase() : 'F'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif-formal text-[0.8125rem] font-semibold text-[var(--ivory)] truncate">
              {profile?.codename || 'Initiate'}
            </span>
            <span className="text-[0.625rem] font-mono text-[var(--antique-gold)] truncate">
              {profile?.member_number || 'SOC-PENDING'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Exit Vault"
          aria-label="Exit Vault"
          className="p-2 text-[var(--muted-grey)] hover:text-[var(--antique-gold)] transition-colors rounded hover:bg-[var(--charcoal)]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
