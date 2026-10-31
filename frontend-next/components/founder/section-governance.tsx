'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Landmark,
  Scroll,
  ShieldCheck,
  History,
  Trophy,
  BookOpen,
  Video,
  Award,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdministrativeAuditLog, MemberProfile } from '@/types/society';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function SectionGovernance() {
  // 1. Audit Logs
  const { data: auditLogs = [], isLoading: isLoadingLogs } = useQuery<AdministrativeAuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: () => api.get<AdministrativeAuditLog[]>('/members/audit-logs'),
  });

  // 2. Roster for Leaderboard
  const { data: roster = [] } = useQuery<MemberProfile[]>({
    queryKey: ['societyRoster'],
    queryFn: () => api.get<MemberProfile[]>('/members/roster'),
  });

  // Top 5 on Leaderboard
  const topFellows = [...roster].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);

  const chambers = [
    {
      title: 'The Round Table',
      subtitle: 'Parliamentary Conclave Chamber',
      href: '/roundtable',
      icon: Landmark,
      badge: 'Quorum Active',
    },
    {
      title: 'Hall of Legends',
      subtitle: 'Monumental Roll of Honour',
      href: '/legends',
      icon: Trophy,
      badge: 'Heroic Deeds',
    },
    {
      title: 'Society Archives',
      subtitle: 'Historical Decrees & Vault',
      href: '/archives',
      icon: BookOpen,
      badge: 'Classified',
    },
    {
      title: 'Founding Charter',
      subtitle: 'Constitutional Precedents',
      href: '/charter',
      icon: Scroll,
      badge: 'Fundamental Law',
    },
    {
      title: 'Security Centre',
      subtitle: 'MFA & Session Revocation',
      href: '/security-centre',
      icon: ShieldCheck,
      badge: 'Hardened',
    },
    {
      title: 'Meeting Room',
      subtitle: 'Synchronous Video Standby',
      href: '/meeting-room',
      icon: Video,
      badge: 'Conclave Portal',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-semibold">
            Constitutional Precedents &bull; Section 05
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[#D8B26E] mt-1 uppercase">
            Governance, Legacy & Audit Ledger
          </h1>
          <p className="text-xs text-[#858995] mt-0.5">
            Institutional Chambers, Meritocratic Elevation & Immutable Security Audit Trail
          </p>
        </div>
      </div>

      {/* Dedicated Chambers Quick Access Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-serif-formal text-xs font-bold text-[#D8B26E] uppercase tracking-wider">
            Dedicated Institutional Chambers
          </span>
          <span className="text-[0.625rem] text-[#858995] font-mono">2026 ARCHITECTURE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chambers.map((ch) => {
            const Icon = ch.icon;
            return (
              <Link
                key={ch.href}
                href={ch.href}
                className="p-5 rounded-[6px] bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.45)] hover:shadow-[0_4px_20px_rgba(197,160,89,0.1)] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-[4px] bg-[#161A22] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#C5A059] group-hover:text-[#D8B26E] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral">{ch.badge}</Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif-formal text-sm font-bold text-[#E9E2D3] group-hover:text-[#D8B26E] transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-[#858995] leading-relaxed">
                    {ch.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#262C3A]/60 flex items-center justify-between text-xs text-[#C5A059] font-serif-formal font-bold">
                  <span>Enter Chamber</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Merit Leaderboard Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C5A059]" />
                  <CardTitle>Sovereign Merit Leaderboard</CardTitle>
                </div>
                <Badge variant="gold">Top Fellows Standing</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Standing</TableHead>
                    <TableHead>Fellow Codename</TableHead>
                    <TableHead>Serial Identifier</TableHead>
                    <TableHead>Societal Rank</TableHead>
                    <TableHead className="text-right">Merit Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topFellows.map((f, idx) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-xs font-bold text-[#C5A059]">
                        #{idx + 1}
                      </TableCell>
                      <TableCell className="font-serif-formal text-xs font-bold text-[#E9E2D3]">
                        {f.codename}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#858995]">
                        {f.member_number || 'SOC-PENDING'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="gold">{f.society_rank || 'Initiate'}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-right text-xs font-bold text-[#D8B26E]">
                        {(f.points || 0).toLocaleString()} PTS
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Immutable Administrative Audit Ledger */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C5A059]" />
              <CardTitle>Tamper-Evident Security Audit Ledger</CardTitle>
            </div>
            <span className="font-mono text-xs text-[#858995]">
              {auditLogs.length} Verified Records
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead>Administrative Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Actor Token</TableHead>
                <TableHead>Audit Attributes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLogs ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[#858995]">
                    Scanning ledger blocks...
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[#858995]">
                    No administrative actions registered in this epoch.
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id} className="font-mono text-xs">
                    <TableCell className="text-[#858995]">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </TableCell>
                    <TableCell className="text-[#D8B26E] font-bold">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-[#E9E2D3]">
                      {log.target_resource}
                    </TableCell>
                    <TableCell className="text-[#C5A059]">
                      {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : 'Sovereign Root'}
                    </TableCell>
                    <TableCell className="text-[#858995] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
