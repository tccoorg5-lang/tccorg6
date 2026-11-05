'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  MessageSquare,
  Shield,
  Trophy,
  Landmark,
  Scroll,
  BookOpen,
  X,
  Compass,
} from 'lucide-react';

interface MobileMemberBottomNavProps {
  activeTab: 'profile' | 'communications' | 'codename';
  onTabChange: (tab: 'profile' | 'communications' | 'codename') => void;
  unreadCount?: number;
  isFounder?: boolean;
}

export function MobileMemberBottomNav({
  activeTab,
  onTabChange,
  unreadCount = 0,
}: MobileMemberBottomNavProps) {
  const [isChambersOpen, setIsChambersOpen] = useState(false);

  const chambers = [
    { href: '/legends', label: 'Hall of Legends', icon: Trophy },
    { href: '/roundtable', label: 'The Round Table', icon: Landmark },
    { href: '/charter', label: 'Founding Charter', icon: Scroll },
    { href: '/archives', label: 'Society Archives', icon: BookOpen },
  ];

  return (
    <>
      {/* Slide-up Chambers Modal Sheet for Mobile */}
      {isChambersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#0F1218] border-t border-[#C5A059]/40 rounded-t-[14px] p-5 pb-8 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div>
                <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase tracking-wider">
                  Institutional Chambers & Rolls
                </h3>
                <span className="text-[0.6875rem] text-[#8993A3]">
                  Monumental chambers, councils, and constitutional archives
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChambersOpen(false)}
                className="p-1.5 text-[#8993A3] hover:text-[#E9E2D3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {chambers.map((ch) => {
                const Icon = ch.icon;
                return (
                  <Link
                    key={ch.href}
                    href={ch.href}
                    onClick={() => setIsChambersOpen(false)}
                    className="p-4 rounded-[6px] bg-[#161A22] border border-[#262C3A] hover:border-[#C5A059] flex flex-col items-center text-center gap-2 group transition-all"
                  >
                    <Icon className="w-5 h-5 text-[#C5A059] group-hover:text-[#D8B26E]" />
                    <span className="font-serif-formal text-xs text-[#E9E2D3] font-semibold">
                      {ch.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Touch Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F1218]/95 backdrop-blur-md border-t border-[#262C3A] px-2 py-1 flex items-center justify-around select-none"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {/* Tab 1: My Profile */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-[4px] transition-all min-h-[48px] ${
            activeTab === 'profile'
              ? 'text-[#D8B26E]'
              : 'text-[#8993A3] hover:text-[#E9E2D3]'
          }`}
        >
          <User className="w-4 h-4 mb-1" />
          <span className="text-[0.625rem] font-serif-formal font-semibold tracking-wider">
            Profile
          </span>
          {activeTab === 'profile' && (
            <span className="w-4 h-0.5 rounded-full bg-[#D8B26E] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Communications */}
        <button
          type="button"
          onClick={() => onTabChange('communications')}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-[4px] relative transition-all min-h-[48px] ${
            activeTab === 'communications'
              ? 'text-[#D8B26E]'
              : 'text-[#8993A3] hover:text-[#E9E2D3]'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 mb-1" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[0.5625rem] font-bold rounded-full bg-[#D8B26E] text-[#080A0E]">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[0.625rem] font-serif-formal font-semibold tracking-wider">
            Dispatches
          </span>
          {activeTab === 'communications' && (
            <span className="w-4 h-0.5 rounded-full bg-[#D8B26E] mt-0.5" />
          )}
        </button>

        {/* Tab 3: Codename */}
        <button
          type="button"
          onClick={() => onTabChange('codename')}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-[4px] transition-all min-h-[48px] ${
            activeTab === 'codename'
              ? 'text-[#D8B26E]'
              : 'text-[#8993A3] hover:text-[#E9E2D3]'
          }`}
        >
          <Shield className="w-4 h-4 mb-1" />
          <span className="text-[0.625rem] font-serif-formal font-semibold tracking-wider">
            Codename
          </span>
          {activeTab === 'codename' && (
            <span className="w-4 h-0.5 rounded-full bg-[#D8B26E] mt-0.5" />
          )}
        </button>

        {/* Chambers Trigger */}
        <button
          type="button"
          onClick={() => setIsChambersOpen(true)}
          className="flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-[4px] text-[#8993A3] hover:text-[#C5A059] transition-all min-h-[48px]"
        >
          <Compass className="w-4 h-4 mb-1 text-[#C5A059]" />
          <span className="text-[0.625rem] font-serif-formal font-semibold tracking-wider text-[#C5A059]">
            Chambers
          </span>
        </button>
      </nav>
    </>
  );
}
