'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { MemberProfile } from '@/types/society';
import { Bell, ShieldAlert, LogOut } from 'lucide-react';
import { clearStoredSession } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  profile: MemberProfile | null;
  activeSectionName?: string;
}

export function MobileHeader({
  title = 'THE SOCIETY',
  subtitle,
  profile,
  activeSectionName,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearStoredSession();
    router.push('/login');
  };

  const isFounder = profile?.society_role === 'founder';

  return (
    <header className="lg:hidden h-14 bg-[#0F1218] border-b border-[#262C3A] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Emblem + Brand */}
      <div className="flex items-center gap-2.5">
        <SocietySeal size={28} glow />
        <div className="flex flex-col">
          <span className="font-serif-formal text-xs font-bold tracking-widest text-[#D8B26E] leading-tight">
            {title}
          </span>
          <span className="text-[0.625rem] font-mono tracking-wider text-[#C5A059] uppercase leading-tight">
            {activeSectionName || subtitle || (isFounder ? 'Founder Authority' : 'Fellow Access')}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Founder Quick Switch (if in member mode) */}
        {isFounder && (
          <Link
            href="/founder"
            className="p-1.5 rounded-[4px] bg-[rgba(92,22,29,0.3)] border border-[rgba(197,160,89,0.3)] text-[#D8B26E]"
            title="Central Command"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>
        )}

        {/* Notifications Shortcut */}
        <Link
          href="/notifications"
          className="p-1.5 rounded-[4px] text-[#858995] hover:text-[#C5A059] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Codename Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#161A22] border border-[#262C3A] text-[0.6875rem] font-serif-formal text-[#E9E2D3]">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
          <span className="truncate max-w-[80px]">{profile?.codename || 'Fellow'}</span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-[#858995] hover:text-[#EF4444] transition-colors"
          title="Exit Vault"
          aria-label="Exit Vault"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
