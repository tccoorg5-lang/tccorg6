'use client';

import React from 'react';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

interface TelemetryPillProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function TelemetryPill({
  className = '',
  variant = 'compact',
}: TelemetryPillProps) {
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#161A22] border border-[#262C3A] text-[0.625rem] font-mono select-none ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
        <span className="text-[#858995]">VAULT PROTOCOL:</span>
        <span className="text-[#C5A059] font-semibold">ED25519 &bull; ENFORCED</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-[6px] bg-[#0F1218] border border-[#262C3A] text-xs font-mono space-y-2 select-none ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#262C3A]/60 pb-2">
        <div className="flex items-center gap-2 text-[#C5A059]">
          <ShieldCheck className="w-4 h-4 text-[#D8B26E]" />
          <span className="font-serif-formal text-[0.6875rem] font-bold tracking-wider uppercase">
            Cryptographic Enclave Telemetry
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[0.625rem] text-[#4ADE80]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
          ACTIVE VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[0.625rem] text-[#858995]">
        <div>
          <span className="block text-[#5C5F68]">ARCHITECTURE:</span>
          <span className="text-[#E9E2D3]">ZERO-TRUST &bull; RLS v2</span>
        </div>
        <div>
          <span className="block text-[#5C5F68]">SIGNATURE CIPHER:</span>
          <span className="text-[#D8B26E]">Ed25519 / SHA-512</span>
        </div>
        <div>
          <span className="block text-[#5C5F68]">CHANNEL INTEGRITY:</span>
          <span className="text-[#38BDF8]">TLS 1.3 SECURE WEBSOCKET</span>
        </div>
        <div>
          <span className="block text-[#5C5F68]">ACCESS CONTROL:</span>
          <span className="text-[#4ADE80]">ROLE-LEVEL LEAST PRIVILEGE</span>
        </div>
      </div>
    </div>
  );
}
