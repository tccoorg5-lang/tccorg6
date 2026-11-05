'use client';

import React, { useState } from 'react';
import {
  Radio,
  ShieldAlert,
  Send,
  MessageSquare,
  Users,
  Calendar,
  Lock,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface ChamberConfig {
  id: string;
  name: string;
  description: string;
  clearance: string;
  participantsCount: number;
  status: 'Open' | 'Restricted' | 'Sealed';
}

const INITIAL_CHAMBERS: ChamberConfig[] = [
  {
    id: 'ch-1',
    name: 'Founding Members\' Sanctum',
    description: 'Ultra-exclusive sanctuary reserved exclusively for Sovereign Founder authority.',
    clearance: 'Founder Class I',
    participantsCount: 1,
    status: 'Sealed',
  },
  {
    id: 'ch-2',
    name: 'The Round Table Conclave',
    description: 'Chamber for parliamentary quorum, merit reviews, and constitutional debates.',
    clearance: 'Council Standing',
    participantsCount: 6,
    status: 'Restricted',
  },
  {
    id: 'ch-3',
    name: 'Mission Alpha Operations Room',
    description: 'Operational coordination hub for commissioned public welfare investigations.',
    clearance: 'Fellow Member',
    participantsCount: 12,
    status: 'Open',
  },
  {
    id: 'ch-4',
    name: 'General Assembly Hall',
    description: 'Universal communication corridor for announcements and institutional updates.',
    clearance: 'All Active Fellows',
    participantsCount: 42,
    status: 'Open',
  },
];

export function SectionCommunications() {
  const { toast } = useToast();
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Meeting Scheduling State
  const [assemblyTitle, setAssemblyTitle] = useState('');
  const [assemblyDate, setAssemblyDate] = useState('');
  const [assemblyAgenda, setAssemblyAgenda] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      toast({
        type: 'success',
        title: 'Sovereign Communiqué Broadcasted',
        description: 'Decree dispatched instantly to all active Fellow communications docks.',
      });
    }, 600);
  };

  const handleScheduleAssembly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assemblyTitle.trim() || !assemblyDate.trim()) return;

    toast({
      type: 'success',
      title: 'Conclave Assembly Scheduled',
      description: `Assembly notice dispatched for ${assemblyDate}. Added to the Meeting Room corridor.`,
    });
    setAssemblyTitle('');
    setAssemblyDate('');
    setAssemblyAgenda('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-semibold">
            Institutional Channels &bull; Section 04
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[#D8B26E] mt-1 uppercase">
            Communications Control
          </h1>
          <p className="text-xs text-[#8993A3] mt-0.5">
            Sovereign Communiqués, Restricted Chamber Access & Synchronous Assembly Governance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Communiqué Broadcaster & Assembly Scheduler */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sovereign Dispatch Broadcaster */}
          <Card variant="gold">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Broadcast Sovereign Communiqué</CardTitle>
                </div>
                <Badge variant="gold">Global Dispatch</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <Input
                  label="Decree / Dispatch Subject"
                  placeholder="e.g. Founder Decree #05 &bull; Operational Directives"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />

                <Textarea
                  label="Decree Text (Recorded in Archival Vault)"
                  rows={4}
                  placeholder="Draft sovereign decree or operational directive to be transmitted to all Fellows..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                />

                <div className="flex justify-between items-center pt-2 border-t border-[#262C3A]/60">
                  <span className="text-[0.6875rem] text-[#8993A3] font-mono">
                    Audience: All Active Enrolled Fellows
                  </span>
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    isLoading={isBroadcasting}
                    disabled={!broadcastMessage.trim()}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Decree</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Synchronous Assembly Conclave Scheduler */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Schedule Synchronous Conclave</CardTitle>
                </div>
                <Badge variant="outline">Meeting Room Corridor</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleAssembly} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Conclave Title"
                    placeholder="e.g. High Council Q4 Deliberation"
                    value={assemblyTitle}
                    onChange={(e) => setAssemblyTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Date & Time (UTC)"
                    placeholder="e.g. Sunday, 15 Nov &bull; 20:00 UTC"
                    value={assemblyDate}
                    onChange={(e) => setAssemblyDate(e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  label="Assembly Agenda & Quorum Objective"
                  rows={2}
                  placeholder="Items for parliamentary discussion and voting resolutions..."
                  value={assemblyAgenda}
                  onChange={(e) => setAssemblyAgenda(e.target.value)}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="secondary" size="md">
                    <span>Publish Assembly Notice</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Restricted Chambers Roster */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Restricted Institutional Chambers</CardTitle>
                </div>
                <Badge variant="neutral">4 Managed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {INITIAL_CHAMBERS.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif-formal text-xs font-bold text-[#D8B26E] uppercase">
                      {ch.name}
                    </span>
                    <Badge
                      variant={
                        ch.status === 'Sealed'
                          ? 'revoked'
                          : ch.status === 'Restricted'
                          ? 'gold'
                          : 'active'
                      }
                    >
                      {ch.status}
                    </Badge>
                  </div>
                  <p className="text-[0.6875rem] text-[#8993A3] leading-relaxed">
                    {ch.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#262C3A]/50 text-[0.625rem] font-mono text-[#8993A3]">
                    <span>CLEARANCE: {ch.clearance}</span>
                    <span>{ch.participantsCount} Authorized</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
