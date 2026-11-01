'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getStoredToken, setStoredProfile } from '@/lib/api';
import { MemberNavRail } from '@/components/navigation/member-nav-rail';
import { MobileHeader } from '@/components/navigation/mobile-header';
import { MobileMemberBottomNav } from '@/components/navigation/mobile-member-bottom-nav';
import { TabProfile } from '@/components/member/tab-profile';
import { TabCommunications } from '@/components/member/tab-communications';
import { TabCodename } from '@/components/member/tab-codename';
import { MemberProfile } from '@/types/society';
import { Loader2 } from 'lucide-react';

export default function MemberPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'communications' | 'codename'>('profile');

  // Verify auth session
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Query member dossier
  const { data: profile, isLoading, error } = useQuery<MemberProfile>({
    queryKey: ['memberProfile'],
    queryFn: () => api.get<MemberProfile>('/members/me'),
    retry: false,
  });

  // Cache profile in localStorage for seamless chamber navigation
  useEffect(() => {
    if (profile) {
      setStoredProfile(profile);
    }
  }, [profile]);

  if (error) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--midnight-black)] text-[var(--antique-gold)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-serif-formal text-sm tracking-widest uppercase">
            Accessing Vault Records...
          </span>
        </div>
      </div>
    );
  }

  const activeSectionName =
    activeTab === 'profile'
      ? 'My Profile'
      : activeTab === 'communications'
      ? 'Communications'
      : 'Codename Dossier';

  return (
    <div className="flex h-screen bg-[var(--midnight-black)] text-[var(--ivory)] overflow-hidden">
      {/* 3-Tab Vertical Navigation Rail (Desktop & Large Tablet Landscape) */}
      <div className="hidden lg:flex shrink-0">
        <MemberNavRail
          profile={profile || null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Responsive Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Hidden on lg+) */}
        <MobileHeader
          title="THE SOCIETY"
          subtitle="Fellow Access"
          profile={profile || null}
          activeSectionName={activeSectionName}
        />

        {/* Tab Panel Content Area */}
        <main
          className={`flex-1 overflow-y-auto bg-[var(--midnight-black)] ${
            activeTab === 'communications'
              ? 'p-0 pb-16 lg:pb-0'
              : 'p-3.5 sm:p-6 lg:p-8 pb-20 lg:pb-8'
          }`}
        >
          {activeTab === 'profile' && <TabProfile profile={profile || null} />}
          {activeTab === 'communications' && (
            <TabCommunications currentProfile={profile || null} />
          )}
          {activeTab === 'codename' && <TabCodename profile={profile || null} />}
        </main>

        {/* Mobile Touch Bottom Navigation (Hidden on lg+) */}
        <MobileMemberBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isFounder={profile?.society_role === 'founder'}
        />
      </div>
    </div>
  );
}
