'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getStoredToken } from '@/lib/api';
import { MemberNavRail } from '@/components/navigation/member-nav-rail';
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

  return (
    <div className="flex h-screen bg-[var(--midnight-black)] text-[var(--ivory)] overflow-hidden">
      {/* 3-Tab Vertical Navigation Rail */}
      <MemberNavRail
        profile={profile || null}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Tab Panel Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-[var(--midnight-black)]">
        {activeTab === 'profile' && <TabProfile profile={profile || null} />}
        {activeTab === 'communications' && (
          <TabCommunications currentProfile={profile || null} />
        )}
        {activeTab === 'codename' && <TabCodename profile={profile || null} />}
      </main>
    </div>
  );
}
