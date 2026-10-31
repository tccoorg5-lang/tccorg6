'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Landmark, Scroll, ShieldCheck, History } from 'lucide-react';
import { api } from '@/lib/api';
import { AdministrativeAuditLog } from '@/types/society';

export function SectionGovernance() {
  const { data: auditLogs = [], isLoading } = useQuery<AdministrativeAuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: () => api.get<AdministrativeAuditLog[]>('/members/audit-logs'),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
            Institutional Governance
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
            Governance & Audit Ledger
          </h1>
          <p className="text-xs text-[var(--muted-grey)] mt-0.5">
            Tamper-Evident Administrative Audit Trail & Constitutional Precedents
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="society-card overflow-hidden border border-[var(--charcoal-border)] space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--antique-gold)]" />
            <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
              Tamper-Evident Audit Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--muted-grey)]">
            {auditLogs.length} Recorded Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--midnight-black)] border-b border-[var(--charcoal-border)] text-[0.6875rem] font-serif-formal text-[var(--antique-gold)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Resource</th>
                <th className="py-3 px-3">Actor Identifier</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--charcoal-border)]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--muted-grey)]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--muted-grey)]">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--charcoal)]/30 font-mono text-[0.6875rem]">
                    <td className="py-3 px-3 text-[var(--muted-grey)] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-3 text-[var(--imperial-gold)] font-bold">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 text-[var(--ivory-muted)]">
                      {log.target_resource}
                    </td>
                    <td className="py-3 px-3 text-[var(--antique-gold)]">
                      {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : 'System'}
                    </td>
                    <td className="py-3 px-3 text-[var(--ivory)] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
