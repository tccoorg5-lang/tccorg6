'use client';

import React from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';

export default function ArchivesPage() {
  const documents = [
    {
      ref: 'ARC-001',
      title: 'Document 001: The Sovereign Decree of Foundation',
      summary: 'Original constitutional charter establishing encrypted vault protocols and single-use cryptographic access.',
    },
    {
      ref: 'ARC-002',
      title: 'Document 002: Lexicon of Conferred Codenames',
      summary: 'Etymological and intellectual taxonomy of codenames assigned to the Fellowship under the meritocratic doctrine.',
    },
    {
      ref: 'ARC-003',
      title: 'Document 003: Guidelines for Lawful Public Accountability',
      summary: 'Standard operating procedures for verifying public filings and forensic documentation without violating privacy statutes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--midnight-black)] text-[var(--ivory)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-4">
          <Link
            href="/member"
            className="society-btn-secondary text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault</span>
          </Link>
          <span className="society-badge">Archival Access</span>
        </div>

        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[var(--imperial-gold)]">
            SOCIETY ARCHIVES
          </h1>
          <p className="font-serif-editorial text-base text-[var(--ivory-muted)] italic">
            Historical Resolutions, Decrees & The Lexicon of Codenames
          </p>
        </div>

        <div className="society-card p-6 md:p-8 space-y-4">
          <div className="space-y-4 divide-y divide-[var(--charcoal-border)]">
            {documents.map((doc) => (
              <div key={doc.ref} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--antique-gold)] shrink-0" />
                    <h3 className="font-serif-formal text-sm md:text-base font-bold text-[var(--imperial-gold)]">
                      {doc.title}
                    </h3>
                  </div>
                  <p className="font-serif-editorial text-xs md:text-sm text-[var(--ivory-muted)] pl-6 italic">
                    {doc.summary}
                  </p>
                </div>
                <span className="font-mono text-[0.6875rem] text-[var(--antique-gold)] shrink-0 pl-6 sm:pl-0">
                  {doc.ref}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
