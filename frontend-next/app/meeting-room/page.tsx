'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ChamberHeader } from '@/components/navigation/chamber-header';
import {
  ArrowLeft,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Radio,
  Lock,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MeetingRoomPage() {
  const { toast } = useToast();
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [joined, setJoined] = useState(false);

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    toast({
      type: 'info',
      title: !micEnabled ? 'Microphone Active' : 'Microphone Muted',
      description: 'Audio input hardware stream updated.',
    });
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    toast({
      type: 'info',
      title: !videoEnabled ? 'Camera Active' : 'Camera Disabled',
      description: 'Visual input hardware stream updated.',
    });
  };

  const handleJoinSession = () => {
    setJoined(true);
    toast({
      type: 'success',
      title: 'Conclave Channel Connected',
      description: 'You have entered the secure synchronous deliberation chamber.',
    });
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-4 sm:p-6 md:p-12 select-none society-grid-bg">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Intelligent Chamber Navigation Header */}
        <ChamberHeader badgeText="Synchronous Conclave Chamber" badgeVariant="gold" />

        {/* Heading */}
        <div className="text-center space-y-2">
          <SocietySeal size={76} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-[#D8B26E] uppercase">
            Meeting Room & Conclave
          </h1>
          <p className="font-serif-editorial text-sm md:text-base text-[#D5CEBF] italic">
            Synchronous Deliberations & Encrypted Audio-Visual Symposia
          </p>
        </div>

        {/* Central Standby Screen */}
        <div className="p-8 md:p-12 rounded-[10px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(197,160,89,0.1)] text-center space-y-6 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E] before:to-transparent">
          {/* Subtle Radar Standby Motif */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#262C3A]" />
            <div className="absolute inset-2 rounded-full border border-[#C5A059]/30 border-dashed" />
            <div className="w-16 h-16 rounded-full bg-[#161A22] border border-[rgba(197,160,89,0.45)] flex items-center justify-center text-[#D8B26E] shadow-[0_0_24px_rgba(197,160,89,0.2)]">
              <Radio className="w-8 h-8 animate-pulse text-[#D8B26E]" />
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-serif-formal text-xl font-bold text-[#E9E2D3] uppercase tracking-wider">
              {joined ? 'Conclave Chamber Active' : 'Chamber in Standby Mode'}
            </h2>
            <p className="font-serif-editorial text-sm text-[#8993A3] italic leading-relaxed">
              Synchronous conclaves convene upon official summons from the Founder or High Council. All media streams are transmitted via encrypted peer channels with human-verified minutes.
            </p>
          </div>

          {/* Media Hardware Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant={micEnabled ? 'gold' : 'secondary'}
              size="md"
              onClick={toggleMic}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>{micEnabled ? 'Mic Active' : 'Mic Muted'}</span>
            </Button>

            <Button
              variant={videoEnabled ? 'gold' : 'secondary'}
              size="md"
              onClick={toggleVideo}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span>{videoEnabled ? 'Camera Active' : 'Camera Off'}</span>
            </Button>

            {!joined ? (
              <Button variant="gold" size="md" onClick={handleJoinSession}>
                <Sparkles className="w-4 h-4" />
                <span>Enter Conclave</span>
              </Button>
            ) : (
              <Button
                variant="burgundy"
                size="md"
                onClick={() => setJoined(false)}
              >
                <span>Leave Conclave</span>
              </Button>
            )}
          </div>

          {/* Security Protocols Footer */}
          <div className="pt-6 border-t border-[#262C3A]/60 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8993A3] font-mono">
            <span>Next Conclave: Conclave IV</span>
            <span>&bull;</span>
            <span>Quorum Requirement: 5 Fellows</span>
            <span>&bull;</span>
            <span className="text-[#4ADE80] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Peer Protocol</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
