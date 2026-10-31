'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SocietySeal } from '@/components/brand/society-seal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Landmark,
  Users,
  CheckCircle2,
  FileText,
  Vote,
  Clock,
  Shield,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface CouncilSeat {
  seatNumber: number;
  codename: string;
  rank: string;
  role: string;
  status: 'Occupied' | 'Vacant' | 'Deliberating';
}

const COUNCIL_SEATS: CouncilSeat[] = [
  { seatNumber: 1, codename: 'DOOM', rank: 'Founder', role: 'Chancellor & Sovereign', status: 'Occupied' },
  { seatNumber: 2, codename: 'VERITAS', rank: 'Senior Fellow', role: 'Public Inquiries Lead', status: 'Occupied' },
  { seatNumber: 3, codename: 'VANGUARD', rank: 'Associate Fellow', role: 'Cybersecurity Architect', status: 'Occupied' },
  { seatNumber: 4, codename: 'AEGIS', rank: 'Senior Fellow', role: 'Archival Custodian', status: 'Occupied' },
  { seatNumber: 5, codename: 'PROMETHEUS', rank: 'Trusted Member', role: 'Research Envoy', status: 'Occupied' },
  { seatNumber: 6, codename: 'CANDIDATE VI', rank: 'Senior Fellow Track', role: 'Vacant Seat', status: 'Vacant' },
  { seatNumber: 7, codename: 'CANDIDATE VII', rank: 'Senior Fellow Track', role: 'Vacant Seat', status: 'Vacant' },
];

export default function RoundTablePage() {
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);

  const castVote = (choice: 'aye' | 'nay') => {
    setHasVoted(true);
    toast({
      type: 'success',
      title: 'Parliamentary Vote Recorded',
      description: `Your vote of "${choice.toUpperCase()}" has been sealed on Resolution 2026-IV.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E9E2D3] p-6 md:p-12 select-none">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#262C3A]/70 pb-4">
          <Link href="/member">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Vault</span>
            </Button>
          </Link>
          <Badge variant="gold">High Council Conclave Chamber</Badge>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <SocietySeal size={72} glow className="mx-auto" />
          <h1 className="font-serif-formal text-3xl font-bold tracking-widest text-[#D8B26E] uppercase">
            The Round Table
          </h1>
          <p className="font-serif-editorial text-sm md:text-base text-[#B5B5BC] italic">
            Parliamentary Governance, Quorum Standing & Constitutional Resolutions
          </p>
        </div>

        {/* Current Conclave Session Card */}
        <Card variant="gold">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[0.625rem] font-serif-formal uppercase tracking-widest text-[#C5A059] block">
                  Active Parliamentary Session
                </span>
                <CardTitle className="mt-1">
                  Conclave IV: Public Oversight & Merit Elevations
                </CardTitle>
              </div>
              <Badge variant="active" className="w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quorum Achieved (5 of 7 Seats)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif-editorial text-sm leading-relaxed text-[#D5CEBF] italic">
              &ldquo;The Round Table convenes to deliberate upon societal strategy, evaluate public accountability investigations, and ratify rank elevations. Decisions are executed under strict parliamentary decorum with recorded roll-call.&rdquo;
            </p>

            {/* Active Resolution Voting Box */}
            <div className="p-4 rounded-[6px] bg-[#161A22] border border-[#262C3A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-[#C5A059]" />
                  <span className="font-serif-formal text-xs font-bold text-[#E9E2D3] uppercase">
                    Resolution 2026-IV &bull; Open-Source Audit Standards
                  </span>
                </div>
                <span className="text-[0.625rem] font-mono text-[#858995]">Voting Open</span>
              </div>
              <p className="text-xs text-[#858995] leading-relaxed">
                Proposal to formalize reproducible cryptographic hashing requirements across all public-interest data dossiers submitted by Fellows.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#262C3A]/60">
                <span className="text-[0.6875rem] text-[#858995] font-mono">
                  Current Tally: 4 Ayes &bull; 0 Nays
                </span>
                {!hasVoted ? (
                  <div className="flex gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => castVote('aye')}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Vote Aye</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => castVote('nay')}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Vote Nay</span>
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-[#4ADE80] font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vote Cast & Ratified
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The 7 High Council Seats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase tracking-wider">
              High Council Seats (Septemvirate)
            </h3>
            <span className="text-[0.625rem] font-mono text-[#858995]">5 Occupied &bull; 2 Vacant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNCIL_SEATS.map((seat) => (
              <div
                key={seat.seatNumber}
                className={`p-4 rounded-[6px] border flex flex-col justify-between space-y-3 ${
                  seat.status === 'Occupied'
                    ? 'bg-[#0F1218] border-[#262C3A] hover:border-[rgba(197,160,89,0.35)]'
                    : 'bg-[#080A0E] border-dashed border-[#262C3A]/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[0.625rem] text-[#C5A059] font-bold">
                    SEAT #{seat.seatNumber}
                  </span>
                  <Badge variant={seat.status === 'Occupied' ? 'gold' : 'neutral'}>
                    {seat.status}
                  </Badge>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-serif-formal text-sm font-bold text-[#E9E2D3]">
                    {seat.codename}
                  </h4>
                  <p className="text-[0.6875rem] text-[#858995] font-serif-editorial italic">
                    {seat.role}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#262C3A]/60 text-[0.625rem] font-mono text-[#858995]">
                  <span>{seat.rank}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
