'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { BookOpen, FileText, Lock, Download, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ChamberHeader } from '@/components/navigation/chamber-header';

interface ArchiveDocument {
  ref: string;
  title: string;
  category: string;
  summary: string;
  classification: string;
  date: string;
}

const ARCHIVE_DOCUMENTS: ArchiveDocument[] = [
  {
    ref: 'ARC-2026-001',
    title: 'The Sovereign Decree of Foundation & Cryptographic Standard',
    category: 'Constitutional Charter',
    summary: 'Original charter establishing the non-indexed private fellowship, single-use high-entropy invitation protocol, and strict cryptographic row-level security.',
    classification: 'Class I Sovereign',
    date: 'Founding Epoch',
  },
  {
    ref: 'ARC-2026-002',
    title: 'The Lexicon of Conferred Codenames & Taxonomic Heraldry',
    category: 'Institutional Taxonomy',
    summary: 'Philosophical and intellectual etymology of official codenames conferred to Fellows. Details the doctrine of pseudonymity as an instrument of meritocracy.',
    classification: 'Class II Internal',
    date: 'Ratified 2026',
  },
  {
    ref: 'ARC-2026-003',
    title: 'Standard Operating Procedures for Lawful Public Accountability',
    category: 'Investigative Doctrine',
    summary: 'Strict methodological guidelines for conducting open-source forensic research into public fund misallocations without violating statutory privacy protections.',
    classification: 'Class III Research',
    date: 'Updated 2026',
  },
  {
    ref: 'ARC-2026-004',
    title: 'Precedents of the High Council Conclave (Sessions I - III)',
    category: 'Parliamentary Minutes',
    summary: 'Verbatim transcripts and certified resolutions governing quorum voting, merit elevations, and disciplinary oversight protocols.',
    classification: 'Council Standing',
    date: 'Permanent Vault',
  },
];

export default function ArchivesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = ARCHIVE_DOCUMENTS.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.ref.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q)
    );
  });

  const handleDownload = (ref: string) => {
    toast({
      type: 'info',
      title: 'Archival Extract Requested',
      description: `Cryptographic digest for ${ref} verified. Signed archival document generated.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-4 sm:p-6 md:p-12 select-none society-grid-bg">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Intelligent Chamber Navigation Header */}
        <ChamberHeader badgeText="Society Historical Archives" badgeVariant="gold" />

        {/* Heading */}
        <div className="text-center space-y-3">
          <SocietySeal size={76} glow className="mx-auto" />
          <h1 className="font-serif-formal text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-[#D8B26E] uppercase">
            Society Archives & Vault
          </h1>
          <p className="font-serif-editorial text-sm md:text-base text-[#D5CEBF] italic">
            Historical Resolutions, Founding Decrees & The Lexicon of Codenames
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archival records, references, categories..."
          />
        </div>

        {/* Documents Ledger */}
        <div className="space-y-4">
          {filtered.map((doc) => (
            <div
              key={doc.ref}
              className="p-6 rounded-[8px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.45)] transition-all space-y-3 shadow-md relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059]/30 before:to-transparent hover:shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262C3A]/60 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D8B26E]" />
                  <span className="font-mono text-xs font-bold text-[#D8B26E]">{doc.ref}</span>
                  <span className="text-[#8993A3] text-xs">&bull;</span>
                  <span className="font-serif-formal text-xs text-[#8993A3] uppercase tracking-wider font-semibold">
                    {doc.category}
                  </span>
                </div>
                <Badge variant="outline">{doc.classification}</Badge>
              </div>

              <h3 className="font-serif-formal text-base font-bold text-[#E9E2D3]">
                {doc.title}
              </h3>

              <p className="font-serif-editorial text-xs md:text-sm text-[#D5CEBF] leading-relaxed italic">
                {doc.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#262C3A]/50 text-xs text-[#8993A3]">
                <span className="font-mono text-[0.625rem]">Date Ratified: {doc.date}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc.ref)}
                  className="text-[0.6875rem] py-1 px-2.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Request Copy</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
