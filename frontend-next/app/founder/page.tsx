'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getStoredToken, setStoredProfile } from '@/lib/api';
import { FounderNavRail, FounderSection } from '@/components/navigation/founder-nav-rail';
import { MobileHeader } from '@/components/navigation/mobile-header';
import { MobileFounderNav } from '@/components/navigation/mobile-founder-nav';
import { SectionCommand } from '@/components/founder/section-command';
import { SectionIntelligence } from '@/components/founder/section-intelligence';
import { SectionOperations } from '@/components/founder/section-operations';
import { SectionCommunications } from '@/components/founder/section-communications';
import { SectionGovernance } from '@/components/founder/section-governance';
import { MemberProfile, CentralCommandMetrics } from '@/types/society';
import { Loader2 } from 'lucide-react';

export default function FounderPortalPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<FounderSection>('command');

  // Verify auth session
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Query member dossier
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery<MemberProfile>({
    queryKey: ['memberProfile'],
    queryFn: () => api.get<MemberProfile>('/members/me'),
    retry: false,
  });

  // Query live Central Command metrics
  const { data: metrics } = useQuery<CentralCommandMetrics>({
    queryKey: ['centralMetrics'],
    queryFn: () => api.get<CentralCommandMetrics>('/members/metrics'),
    enabled: profile?.society_role === 'founder',
    refetchInterval: 10000,
  });

  // Strict Founder clearance check and profile cache
  useEffect(() => {
    if (profile) {
      setStoredProfile(profile);
      if (profile.society_role !== 'founder') {
        alert('Access Restricted: Founder Credentials Required');
        router.push('/member');
      }
    }
  }, [profile, router]);

  if (profileError) {
    router.push('/login');
    return null;
  }

  if (isProfileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--midnight-black)] text-[var(--antique-gold)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-serif-formal text-sm tracking-widest uppercase">
            Verifying Sovereign Clearance...
          </span>
        </div>
      </div>
    );
  }

  const sectionTitles: Record<FounderSection, string> = {
    command: 'Central Command',
    intelligence: 'Membership Roster',
    operations: 'Operations & Challenges',
    communications: 'Communications Control',
    governance: 'Governance & Legacy',
  };

  return (
    <div className="flex h-screen bg-[var(--midnight-black)] text-[var(--ivory)] overflow-hidden">
      {/* 5-Section Command Navigation Rail (Desktop & Large Tablet Landscape) */}
      <div className="hidden lg:flex shrink-0">
        <FounderNavRail
          profile={profile || null}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Hidden on lg+) */}
        <MobileHeader
          title="CENTRAL COMMAND"
          subtitle="Founder Authority"
          profile={profile || null}
          activeSectionName={sectionTitles[activeSection]}
        />

        {/* Section View Workspace */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-20 lg:pb-8 bg-[var(--midnight-black)]">
          {activeSection === 'command' && (
            <SectionCommand
              metrics={metrics || null}
              onOpenInviteModal={() => setActiveSection('intelligence')}
            />
          )}
          {activeSection === 'intelligence' && <SectionIntelligence />}
          {activeSection === 'operations' && <SectionOperations />}
          {activeSection === 'communications' && <SectionCommunications />}
          {activeSection === 'governance' && <SectionGovernance />}
        </main>

        {/* Mobile Founder Navigation (Hidden on lg+) */}
        <MobileFounderNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
    </div>
  );
}
