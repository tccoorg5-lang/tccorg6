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
  Radio,
  Lock,
} from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';
import { TelemetryPill } from '@/components/brand/telemetry-pill';
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
    { href: '/archives', label: 'Society Archives', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-[#0F1218] border-r border-[#262C3A] flex flex-col justify-between shrink-0 h-screen select-none overflow-y-auto relative z-20">
      <div>
        {/* Institutional Emblem & Brand Header */}
        <div className="p-5 border-b border-[#262C3A] flex items-center gap-3 bg-[#080A0E]/50">
          <SocietySeal size={40} glow />
          <div className="flex flex-col">
            <span className="font-serif-formal text-[0.875rem] font-bold tracking-[0.14em] text-[#D8B26E] uppercase">
              The Society
            </span>
            <span className="text-[0.625rem] font-mono tracking-wider text-[#C5A059] uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              Fellow Access
            </span>
          </div>
        </div>

        {/* 3 Primary Navigation Tabs */}
        <div className="p-3">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[#8993A3] px-3 mb-2 font-semibold">
            Chambers Navigation
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => onTabChange('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[4px] text-[0.8125rem] font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[rgba(197,160,89,0.18)] to-[rgba(197,160,89,0.05)] text-[#D8B26E] border-l-2 border-[#D8B26E] shadow-[0_2px_16px_rgba(197,160,89,0.1)]'
                  : 'text-[#E9E2D3] hover:bg-[#161A22] hover:text-[#D8B26E]'
              }`}
            >
              <User className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-[#D8B26E]' : 'text-[#8993A3]'}`} />
              <span className="font-serif-formal tracking-wider">My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('communications')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[4px] text-[0.8125rem] font-medium transition-all ${
                activeTab === 'communications'
                  ? 'bg-gradient-to-r from-[rgba(197,160,89,0.18)] to-[rgba(197,160,89,0.05)] text-[#D8B26E] border-l-2 border-[#D8B26E] shadow-[0_2px_16px_rgba(197,160,89,0.1)]'
                  : 'text-[#E9E2D3] hover:bg-[#161A22] hover:text-[#D8B26E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'communications' ? 'text-[#D8B26E]' : 'text-[#8993A3]'}`} />
                <span className="font-serif-formal tracking-wider">Communications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[0.625rem] font-bold rounded-full bg-[#D8B26E] text-[#080A0E] shadow-[0_0_8px_rgba(216,178,110,0.5)]">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('codename')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[4px] text-[0.8125rem] font-medium transition-all ${
                activeTab === 'codename'
                  ? 'bg-gradient-to-r from-[rgba(197,160,89,0.18)] to-[rgba(197,160,89,0.05)] text-[#D8B26E] border-l-2 border-[#D8B26E] shadow-[0_2px_16px_rgba(197,160,89,0.1)]'
                  : 'text-[#E9E2D3] hover:bg-[#161A22] hover:text-[#D8B26E]'
              }`}
            >
              <Shield className={`w-4 h-4 shrink-0 ${activeTab === 'codename' ? 'text-[#D8B26E]' : 'text-[#8993A3]'}`} />
              <span className="font-serif-formal tracking-wider">Codename</span>
            </button>

            {/* Founder Central Command Shortcut */}
            {isFounder && (
              <div className="pt-2 mt-2 border-t border-[#262C3A]/60">
                <Link
                  href="/founder"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-[0.8125rem] font-medium text-[#E9E2D3] bg-[#5C161D]/25 border border-[#8C232D]/60 hover:bg-[#5C161D]/45 hover:border-[#D8B26E] transition-all"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#D8B26E]" />
                  <span className="font-serif-formal tracking-wider font-semibold">Central Command</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Dedicated Chambers & Rolls */}
        <div className="p-3 border-t border-[#262C3A]">
          <div className="text-[0.625rem] font-serif-formal tracking-widest uppercase text-[#8993A3] px-3 mb-2 font-semibold">
            Institutional Chambers
          </div>
          <nav className="space-y-0.5">
            {dedicatedChambers.map((ch) => {
              const Icon = ch.icon;
              return (
                <Link
                  key={ch.href}
                  href={ch.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[4px] text-[0.75rem] font-medium text-[#8993A3] hover:bg-[#161A22] hover:text-[#D8B26E] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" />
                  <span>{ch.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Enclave Telemetry Pill */}
        <div className="px-4 py-2">
          <TelemetryPill variant="compact" className="w-full justify-center" />
        </div>
      </div>

      {/* Rail Footer (Member Pill & Logout) */}
      <div className="p-3 border-t border-[#262C3A] bg-[#080A0E]/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[rgba(197,160,89,0.35)] flex items-center justify-center font-serif-formal text-[0.875rem] font-bold text-[#D8B26E] shrink-0">
            {profile?.codename ? profile.codename[0].toUpperCase() : 'F'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif-formal text-[0.8125rem] font-semibold text-[#E9E2D3] truncate">
              {profile?.codename || 'Initiate'}
            </span>
            <span className="text-[0.625rem] font-mono text-[#C5A059] truncate">
              {profile?.member_number || 'SOC-PENDING'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Exit Vault"
          aria-label="Exit Vault"
          className="p-2 text-[#8993A3] hover:text-[#EF4444] hover:bg-[#161A22] transition-colors rounded-[4px]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
