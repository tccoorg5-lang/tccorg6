'use client';

import React from 'react';
import { Radio, ShieldAlert, Send, MessageSquare } from 'lucide-react';

export function SectionCommunications() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
            Institutional Channels
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
            Communications Control
          </h1>
          <p className="text-xs text-[var(--muted-grey)] mt-0.5">
            Founder Communiqués, Restricted Chambers & Transmission Auditing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Founder Global Dispatch Broadcaster */}
        <div className="society-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--charcoal-border)] pb-3">
            <Radio className="w-4 h-4 text-[var(--antique-gold)]" />
            <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
              Broadcast Sovereign Communiqué
            </h3>
          </div>

          <p className="text-xs text-[var(--muted-grey)]">
            Transmits an official Founder decree to all active fellows. Recorded in permanent institutional archives.
          </p>

          <textarea
            rows={4}
            placeholder="Draft institutional decree or operational dispatch..."
            className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] p-3 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)] resize-none"
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-[0.6875rem] text-[var(--muted-grey)] font-mono">
              Audience: All Active Fellows
            </span>
            <button type="button" className="society-btn-primary text-xs py-2 px-4">
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </div>
        </div>

        {/* Restricted Chambers */}
        <div className="society-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--charcoal-border)] pb-3">
            <ShieldAlert className="w-4 h-4 text-[var(--antique-gold)]" />
            <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
              Restricted Societal Chambers
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[var(--midnight-black)] border border-[var(--charcoal-border)] rounded flex items-center justify-between">
              <div>
                <div className="font-serif-formal text-xs font-bold text-[var(--imperial-gold)]">
                  The Round Table Conclave
                </div>
                <div className="text-[0.6875rem] text-[var(--muted-grey)]">Council & Senior Fellows</div>
              </div>
              <span className="society-badge text-[0.625rem]">Restricted</span>
            </div>

            <div className="p-3 bg-[var(--midnight-black)] border border-[var(--charcoal-border)] rounded flex items-center justify-between">
              <div>
                <div className="font-serif-formal text-xs font-bold text-[var(--imperial-gold)]">
                  Founders’ Chamber
                </div>
                <div className="text-[0.6875rem] text-[var(--muted-grey)]">Permanent Administrator Only</div>
              </div>
              <span className="society-badge text-[0.625rem] border-[#991B1B] text-[#F87171] bg-red-950/20">
                Class I Secret
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
