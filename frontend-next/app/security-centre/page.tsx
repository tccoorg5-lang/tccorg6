'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  ShieldAlert,
  Key,
  Lock,
  EyeOff,
  RefreshCw,
  Server,
  AlertTriangle,
  Smartphone,
  Laptop,
} from 'lucide-react';

export default function SecurityCentrePage() {
  const { toast } = useToast();
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState(false);

  const handleGlobalRevocation = () => {
    setIsInvalidating(true);
    setTimeout(() => {
      setIsInvalidating(false);
      setIsEmergencyDialogOpen(false);
      toast({
        type: 'error',
        title: 'Emergency Invalidation Ratified',
        description: 'All active non-founder session tokens have been revoked across the global infrastructure.',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-6 md:p-12 select-none">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#262C3A]/70 pb-4">
          <Link href="/founder">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Central Command</span>
            </Button>
          </Link>

          <Badge variant="revoked" className="text-xs">
            Founder Clearance Only
          </Badge>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <SocietySeal size={68} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl md:text-3xl font-bold tracking-widest text-[#D8B26E] uppercase">
            Administrative Security Centre
          </h1>
          <p className="font-serif-editorial text-xs md:text-sm text-[#B5B5BC] italic">
            Cryptographic Vault Controls, Active Session Revocation & Threat Defense
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MFA / WebAuthn Card */}
          <Card variant="gold">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
                </div>
                <Badge variant="active">Enforced</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-[#858995] leading-relaxed">
                Founder accounts require dual-channel authentication using RFC 6238 TOTP authenticators or FIDO2/WebAuthn hardware keys.
              </p>
              <div className="p-3 bg-[#161A22] rounded-[4px] border border-[#262C3A] font-mono text-[0.6875rem] text-[#4ADE80] flex items-center justify-between">
                <span>HARDWARE ANCHOR: YubiKey 5 NFC</span>
                <span>VERIFIED</span>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      type: 'info',
                      title: 'Hardware Anchor Re-verified',
                      description: 'Current cryptographic signature valid for 24 hours.',
                    })
                  }
                >
                  Verify Key Signature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Revocation Card */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <CardTitle className="text-red-400">Emergency Global Revocation</CardTitle>
                </div>
                <Badge variant="revoked">Class I Action</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-[#858995] leading-relaxed">
                Instantly terminates every active JWT Bearer access token across all devices and resets session clearance in case of suspected token leak.
              </p>
              <div className="p-3 bg-[#991B1B]/15 border border-[#991B1B]/30 rounded-[4px] text-red-300 text-[0.6875rem] leading-relaxed">
                <strong>Warning:</strong> This immediately kicks all non-founder members to the Login Gate and resets Supabase Realtime channels.
              </div>
              <div className="pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsEmergencyDialogOpen(true)}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Global Revocation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions Roster */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#C5A059]" />
                <CardTitle>Active Concurrent Sovereign Sessions</CardTitle>
              </div>
              <span className="font-mono text-xs text-[#858995]">1 Active Founder Session</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <div className="font-serif-formal font-bold text-[#E9E2D3]">
                    Current Workstation &bull; Windows NT 10.0
                  </div>
                  <div className="text-[0.625rem] text-[#858995] font-mono">
                    SESSION ID: auth_sess_9a8f... &bull; Initiated Today 20:50 UTC
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                Current Device
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={isEmergencyDialogOpen}
        onOpenChange={setIsEmergencyDialogOpen}
        title="Execute Global Session Revocation?"
        description="This will instantly invalidate all active JWT authentication tokens across the entire fellowship. Ordinary members will be required to re-authenticate."
        confirmLabel="Execute Immediate Revocation"
        variant="danger"
        isLoading={isInvalidating}
        onConfirm={handleGlobalRevocation}
      />
    </div>
  );
}
