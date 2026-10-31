'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken, api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { SocietySeal } from '@/components/brand/society-seal';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    api
      .get<any>('/members/me')
      .then((profile) => {
        if (profile?.society_role === 'founder') {
          router.replace('/founder');
        } else {
          router.replace('/member');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--midnight-black)] text-[var(--antique-gold)]">
      <div className="flex flex-col items-center gap-3">
        <SocietySeal size={64} glow />
        <div className="flex items-center gap-2 mt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-serif-formal text-xs tracking-widest uppercase">
            Resolving Vault Clearance...
          </span>
        </div>
      </div>
    </div>
  );
}
