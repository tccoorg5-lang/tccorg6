'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Target,
  Radio,
  Landmark,
  Compass,
  Trophy,
  Scroll,
  BookOpen,
  Video,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FounderSection } from '@/components/navigation/founder-nav-rail';

interface MobileFounderNavProps {
  activeSection: FounderSection;
  onSectionChange: (section: FounderSection) => void;
}

export function MobileFounderNav({
  activeSection,
  onSectionChange,
}: MobileFounderNavProps) {
  const [isChambersOpen, setIsChambersOpen] = useState(false);

  const sections: { id: FounderSection; label: string; icon: any }[] = [
    { id: 'command', label: 'Command', icon: LayoutDashboard },
    { id: 'intelligence', label: 'Roster', icon: Users },
    { id: 'operations', label: 'Ops', icon: Target },
    { id: 'communications', label: 'Comms', icon: Radio },
    { id: 'governance', label: 'Gov', icon: Landmark },
  ];

  const dedicatedChambers = [
    { href: '/legends', label: 'Hall of Legends', icon: Trophy },
    { href: '/roundtable', label: 'The Round Table', icon: Landmark },
    { href: '/charter', label: 'Founding Charter', icon: Scroll },
    { href: '/archives', label: 'Society Archives', icon: BookOpen },
    { href: '/meeting-room', label: 'Meeting Room', icon: Video },
    { href: '/security-centre', label: 'Security Centre', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Slide-up Chambers Modal Sheet for Founder */}
      {isChambersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#0F1218] border-t border-[#C5A059]/40 rounded-t-[12px] p-5 pb-8 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div>
                <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase tracking-wider">
                  Sovereign Chambers & Directives
                </h3>
                <span className="text-[0.6875rem] text-[#858995]">
                  High councils, rolls of honour, and cryptographic controls
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChambersOpen(false)}
                className="p-1.5 text-[#858995] hover:text-[#E9E2D3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {dedicatedChambers.map((ch) => {
                const Icon = ch.icon;
                return (
                  <Link
                    key={ch.href}
                    href={ch.href}
                    onClick={() => setIsChambersOpen(false)}
                    className="p-3.5 rounded-[6px] bg-[#161A22] border border-[#262C3A] hover:border-[#C5A059] flex flex-col items-center text-center gap-2 group transition-all"
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

      {/* Persistent Touch Bottom Navigation Bar for Founder */}
      <nav
        aria-label="Founder Command Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F1218]/95 backdrop-blur-md border-t border-[#262C3A] px-2 py-1 flex items-center justify-around select-none"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSectionChange(sec.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-[4px] transition-all min-h-[48px] ${
                isActive
                  ? 'text-[#D8B26E]'
                  : 'text-[#858995] hover:text-[#E9E2D3]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[0.5625rem] font-serif-formal font-semibold tracking-wider">
                {sec.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-[#D8B26E] mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Chambers Trigger */}
        <button
          type="button"
          onClick={() => setIsChambersOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-[4px] text-[#858995] hover:text-[#C5A059] transition-all min-h-[48px]"
        >
          <Compass className="w-4 h-4 mb-0.5 text-[#C5A059]" />
          <span className="text-[0.5625rem] font-serif-formal font-semibold tracking-wider text-[#C5A059]">
            More
          </span>
        </button>
      </nav>
    </>
  );
}
