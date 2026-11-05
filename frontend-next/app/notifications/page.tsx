'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Bell,
  Check,
  Radio,
  Award,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { isFounderSession } from '@/lib/api';

interface NotificationItem {
  id: string;
  category: 'decree' | 'operation' | 'dispatch' | 'security';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'decree',
    title: 'Founder Decree #04 &bull; 2026 Technological Transformation',
    description: 'The Society has concluded its migration to Next.js 16 and hardened FastAPI services. Single-use invitation tokens and strict RLS are in active enforcement.',
    time: '2 hours ago',
    isRead: false,
    link: '/charter',
  },
  {
    id: 'notif-2',
    category: 'operation',
    title: 'Operation Sovereign Audit &bull; Submission Approved',
    description: 'Your research submission for municipal infrastructure transparency was reviewed and approved. 250 merit honorific points have been credited to your dossier.',
    time: 'Yesterday',
    isRead: false,
    link: '/member',
  },
  {
    id: 'notif-3',
    category: 'dispatch',
    title: 'New Encrypted Dispatch from Fellow Vanguard',
    description: 'Encrypted message received in your private dispatch channel.',
    time: '2 days ago',
    isRead: true,
    link: '/member',
  },
  {
    id: 'notif-4',
    category: 'security',
    title: 'Hardware Key Authentication Registered',
    description: 'Sovereign security anchor confirmed for session verification.',
    time: '3 days ago',
    isRead: true,
    link: '/security-centre',
  },
];

export default function NotificationCentrePage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'decree' | 'operation'>('all');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast({
      type: 'info',
      title: 'Ledger Updated',
      description: 'All notifications marked as read.',
    });
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'decree') return n.category === 'decree';
    if (filter === 'operation') return n.category === 'operation';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-4 sm:p-6 md:p-12 select-none society-grid-bg">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#262C3A]/70 pb-4">
          <Link href={isFounderSession() ? '/founder' : '/member'}>
            <Button variant="secondary" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFounderSession() ? 'Return to Central Command' : 'Return to Chambers'}</span>
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </Button>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl md:text-3xl font-bold tracking-widest text-[#D8B26E] uppercase">
            Notification Centre
          </h1>
          <p className="font-serif-editorial text-xs md:text-sm text-[#D5CEBF] italic">
            Institutional Decrees, Operational Directives & Dispatch Alerts
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-serif-formal uppercase tracking-wider transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#D8B26E] to-[#C5A059] text-[#080A0E] font-bold shadow-md'
                : 'bg-[#161A22] text-[#8993A3] hover:text-[#E9E2D3]'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-serif-formal uppercase tracking-wider transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-[#D8B26E] to-[#C5A059] text-[#080A0E] font-bold shadow-md'
                : 'bg-[#161A22] text-[#8993A3] hover:text-[#E9E2D3]'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('decree')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-serif-formal uppercase tracking-wider transition-all ${
              filter === 'decree'
                ? 'bg-gradient-to-r from-[#D8B26E] to-[#C5A059] text-[#080A0E] font-bold shadow-md'
                : 'bg-[#161A22] text-[#8993A3] hover:text-[#E9E2D3]'
            }`}
          >
            Founder Decrees
          </button>
          <button
            type="button"
            onClick={() => setFilter('operation')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-serif-formal uppercase tracking-wider transition-all ${
              filter === 'operation'
                ? 'bg-gradient-to-r from-[#D8B26E] to-[#C5A059] text-[#080A0E] font-bold shadow-md'
                : 'bg-[#161A22] text-[#8993A3] hover:text-[#E9E2D3]'
            }`}
          >
            Operations & Challenges
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-[8px] bg-[#0F1218] border border-[#262C3A] text-xs text-[#8993A3] space-y-2">
              <Bell className="w-8 h-8 text-[#C5A059]/40 mx-auto" />
              <p>No active alerts in this ledger filter.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-[8px] border transition-all flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? 'bg-[#1B2029] border-[rgba(197,160,89,0.4)] shadow-[0_4px_20px_rgba(197,160,89,0.08)]'
                    : 'bg-[#0F1218] border-[#262C3A]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-center text-[#D8B26E] shrink-0 mt-0.5">
                    {item.category === 'decree' ? (
                      <Radio className="w-4 h-4" />
                    ) : item.category === 'operation' ? (
                      <Award className="w-4 h-4" />
                    ) : item.category === 'dispatch' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-formal text-xs font-bold text-[#E9E2D3] uppercase tracking-wide">
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#D8B26E] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-[#8993A3] leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-[0.625rem] text-[#8993A3] font-mono pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>

                {item.link && (
                  <Link href={item.link}>
                    <Button variant="secondary" size="sm" className="shrink-0 text-[0.6875rem]">
                      View
                    </Button>
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
