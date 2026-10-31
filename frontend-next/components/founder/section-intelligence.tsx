'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, KeyRound, Copy, Check, Shield, AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { MemberProfile } from '@/types/society';
import { formatInductionDate } from '@/lib/utils';

export function SectionIntelligence() {
  const queryClient = useQueryClient();
  const [filterQuery, setFilterQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [intendedName, setIntendedName] = useState('');
  const [intendedEmail, setIntendedEmail] = useState('');
  const [assignedCodename, setAssignedCodename] = useState('');
  const [assignedRole, setAssignedRole] = useState('member');
  const [assignedRank, setAssignedRank] = useState('Initiate');
  const [expiryDays, setExpiryDays] = useState(7);
  const [formError, setFormError] = useState('');

  // 1. Fetch Roster
  const { data: roster = [], isLoading } = useQuery<MemberProfile[]>({
    queryKey: ['societyRoster'],
    queryFn: () => api.get<MemberProfile[]>('/members/roster'),
  });

  // 2. Issue Invitation Mutation
  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post<any>('/invitations/create', {
        intended_name: intendedName.trim(),
        intended_email: intendedEmail.trim().toLowerCase(),
        assigned_codename: assignedCodename.trim(),
        assigned_role: assignedRole,
        assigned_rank: assignedRank,
        expiry_days: expiryDays,
      }),
    onSuccess: (data) => {
      setGeneratedToken(data.plain_token);
      queryClient.invalidateQueries({ queryKey: ['centralMetrics'] });
      // Clear inputs
      setIntendedName('');
      setIntendedEmail('');
      setAssignedCodename('');
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to issue invitation token');
    },
  });

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredRoster = roster.filter((m) => {
    const q = filterQuery.toLowerCase();
    return (
      (m.codename || '').toLowerCase().includes(q) ||
      (m.member_number || '').toLowerCase().includes(q) ||
      (m.society_rank || '').toLowerCase().includes(q) ||
      (m.society_role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--charcoal-border)] pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[var(--antique-gold)] uppercase font-semibold">
            Institutional Roster
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[var(--imperial-gold)] mt-1">
            Membership Intelligence
          </h1>
          <p className="text-xs text-[var(--muted-grey)] mt-0.5">
            Cryptographic Inductions, Conferred Codenames & Merit Standings
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setGeneratedToken(null);
            setIsInviteModalOpen(true);
          }}
          className="society-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Invitation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by codename, identifier, rank..."
            className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-4 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
          />
        </div>
        <div className="text-xs text-[var(--muted-grey)] font-mono">
          Showing {filteredRoster.length} of {roster.length} Inducted Fellows
        </div>
      </div>

      {/* Roster Table */}
      <div className="society-card overflow-hidden border border-[var(--charcoal-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--midnight-black)] border-b border-[var(--charcoal-border)] text-[0.6875rem] font-serif-formal text-[var(--antique-gold)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fellow Codename</th>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Constitutional Role</th>
                <th className="py-3 px-4">Societal Rank</th>
                <th className="py-3 px-4 text-right">Merit Points</th>
                <th className="py-3 px-4">Induction Date</th>
                <th className="py-3 px-4 text-center">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--charcoal-border)]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--muted-grey)]">
                    Scanning intelligence roster...
                  </td>
                </tr>
              ) : filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--muted-grey)]">
                    No fellows match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--charcoal)]/30 transition-colors">
                    <td className="py-3.5 px-4 font-serif-formal text-sm font-bold text-[var(--imperial-gold)] flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[var(--charcoal)] border border-[var(--gold-border)] flex items-center justify-center font-bold text-xs text-[var(--antique-gold)]">
                        {(m.codename || 'F')[0].toUpperCase()}
                      </div>
                      <span>{m.codename || 'Unknown'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--ivory)] font-semibold">
                      {m.member_number || 'SOC-PENDING'}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[0.6875rem] tracking-wider text-[var(--ivory-muted)]">
                      {m.society_role}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="society-badge text-[0.625rem]">
                        {m.society_rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-[var(--imperial-gold)] font-bold">
                      {m.points.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--muted-grey)]">
                      {formatInductionDate(m.induction_date)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[0.6875rem] text-[#4ADE80]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Issue Cryptographic Invitation Token */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="society-card max-w-lg w-full p-6 space-y-5 border border-[var(--gold-border)]">
            <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[var(--antique-gold)]" />
                <h3 className="font-serif-formal text-base font-bold text-[var(--imperial-gold)]">
                  Issue Cryptographic Invitation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[var(--muted-grey)] hover:text-[var(--ivory)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedToken ? (
              /* Token Reveal State */
              <div className="space-y-4">
                <div className="p-4 rounded bg-[rgba(46,125,50,0.12)] border border-[rgba(46,125,50,0.3)] text-xs text-[#4ADE80] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Cryptographic Token Successfully Generated
                  </div>
                  <p className="text-[var(--ivory-muted)]">
                    This token is single-use and bound exclusively to the designated candidate email.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                    High-Entropy Invitation Token (Copy Now)
                  </label>
                  <div className="p-3 bg-[var(--midnight-black)] border border-[var(--gold-border)] rounded flex items-center justify-between gap-3 font-mono text-xs text-[var(--imperial-gold)] break-all select-all">
                    <span>{generatedToken}</span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="society-btn-primary text-xs py-1.5 px-3 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded bg-[rgba(153,27,27,0.15)] border border-[rgba(153,27,27,0.3)] text-[0.6875rem] text-[var(--ivory-muted)] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                  <span>
                    <strong>Security Notice:</strong> The unhashed token is never stored and cannot be retrieved again. Securely convey this token to the intended candidate.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setGeneratedToken(null);
                    }}
                    className="society-btn-secondary"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form State */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  inviteMutation.mutate();
                }}
                className="space-y-4"
              >
                {formError && (
                  <div className="p-3 rounded bg-[rgba(153,27,27,0.2)] border border-[#991B1B] text-xs text-[#FCA5A5]">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                      Intended Real Name
                    </label>
                    <input
                      type="text"
                      required
                      value={intendedName}
                      onChange={(e) => setIntendedName(e.target.value)}
                      placeholder="e.g. Arthur Pendelton"
                      className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                      Intended Email
                    </label>
                    <input
                      type="email"
                      required
                      value={intendedEmail}
                      onChange={(e) => setIntendedEmail(e.target.value)}
                      placeholder="recipient@domain.com"
                      className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                    Assigned Codename
                  </label>
                  <input
                    type="text"
                    required
                    value={assignedCodename}
                    onChange={(e) => setAssignedCodename(e.target.value)}
                    placeholder="e.g. Vanguard, Veritas, Sovereign"
                    className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                      Constitutional Role
                    </label>
                    <select
                      value={assignedRole}
                      onChange={(e) => setAssignedRole(e.target.value)}
                      className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                    >
                      <option value="member">Member</option>
                      <option value="initiate">Initiate</option>
                      <option value="council">Council</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                      Initial Rank
                    </label>
                    <select
                      value={assignedRank}
                      onChange={(e) => setAssignedRank(e.target.value)}
                      className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                    >
                      <option value="Initiate">Initiate</option>
                      <option value="Associate">Associate</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Trusted Member">Trusted Member</option>
                      <option value="Senior Member">Senior Member</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.6875rem] font-serif-formal uppercase text-[var(--antique-gold)]">
                      Expiry (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                      className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--charcoal-border)]">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="society-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="society-btn-primary disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? 'Generating Cryptographic Token...' : 'Generate Token'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
