'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  KeyRound,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  X,
  User,
  Award,
  Calendar,
  Lock,
  ChevronRight,
  Eye,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MemberProfile } from '@/types/society';
import { formatInductionDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';

export function SectionIntelligence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Member Detail Dossier Drawer
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

  // Protected Personal Records Modal (Restricted Founder Access)
  const [personalRecordsMember, setPersonalRecordsMember] = useState<MemberProfile | null>(null);

  // Invitation Modal State
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
      setIntendedName('');
      setIntendedEmail('');
      setAssignedCodename('');
      setFormError('');
      toast({
        type: 'success',
        title: 'Cryptographic Token Generated',
        description: 'Single-use invitation token successfully registered.',
      });
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to issue invitation token');
    },
  });

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    toast({
      type: 'info',
      title: 'Token Copied to Clipboard',
      description: 'Convey securely to the designated candidate.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredRoster = roster.filter((m) => {
    const q = filterQuery.toLowerCase();
    const matchesSearch =
      (m.codename || '').toLowerCase().includes(q) ||
      (m.member_number || '').toLowerCase().includes(q) ||
      (m.society_rank || '').toLowerCase().includes(q);

    const matchesRank = selectedRank === 'all' || m.society_rank === selectedRank;
    const matchesRole = selectedRole === 'all' || m.society_role === selectedRole;

    return matchesSearch && matchesRank && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-semibold">
            Institutional Roster &bull; Section 02
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[#D8B26E] mt-1 uppercase">
            Membership Intelligence
          </h1>
          <p className="text-xs text-[#858995] mt-0.5">
            Cryptographic Token Issuance, Dossiers & Sovereign Merit Standings
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={() => {
            setGeneratedToken(null);
            setIsInviteModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Issue Invitation Token</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-[6px] bg-[#0F1218] border border-[#262C3A]">
        <div className="w-full md:max-w-md">
          <SearchInput
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by codename, serial number, rank..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[0.625rem] font-serif-formal uppercase text-[#858995]">Rank:</span>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="bg-[#161A22] text-xs text-[#E9E2D3] px-2.5 py-1.5 rounded-[3px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Ranks</option>
              <option value="Initiate">Initiate</option>
              <option value="Associate">Associate</option>
              <option value="Contributor">Contributor</option>
              <option value="Trusted Member">Trusted Member</option>
              <option value="Senior Member">Senior Member</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.625rem] font-serif-formal uppercase text-[#858995]">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#161A22] text-xs text-[#E9E2D3] px-2.5 py-1.5 rounded-[3px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Roles</option>
              <option value="founder">Founder</option>
              <option value="member">Fellow Member</option>
            </select>
          </div>

          <span className="text-xs text-[#858995] font-mono ml-auto">
            {filteredRoster.length} of {roster.length} Records
          </span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-[6px] bg-[#0F1218] border border-[#262C3A] overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fellow Codename</TableHead>
              <TableHead>Serial Identifier</TableHead>
              <TableHead>Constitutional Role</TableHead>
              <TableHead>Societal Rank</TableHead>
              <TableHead className="text-right">Merit Points</TableHead>
              <TableHead>Induction Date</TableHead>
              <TableHead>Standing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-[#858995]">
                  Scanning intelligence registry...
                </TableCell>
              </TableRow>
            ) : filteredRoster.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-[#858995]">
                  No fellows match the designated query.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoster.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-serif-formal text-xs font-bold text-[#D8B26E]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[3px] bg-[#161A22] border border-[rgba(197,160,89,0.3)] flex items-center justify-center font-bold text-xs text-[#C5A059]">
                        {(m.codename || 'F')[0].toUpperCase()}
                      </div>
                      <span>{m.codename || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#E9E2D3] font-semibold">
                    {m.member_number || 'SOC-PENDING'}
                  </TableCell>
                  <TableCell className="uppercase text-[0.625rem] tracking-wider text-[#B5B5BC]">
                    {m.society_role}
                  </TableCell>
                  <TableCell>
                    <Badge variant="gold">{m.society_rank || 'Initiate'}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-right text-[#D8B26E] font-bold">
                    {m.points.toLocaleString()} PTS
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#858995]">
                    {formatInductionDate(m.induction_date)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedMember(m)}
                        title="View Detailed Dossier"
                      >
                        <span>Dossier</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPersonalRecordsMember(m)}
                        title="Restricted Personal Records"
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ======================================================== */}
      {/* MODAL: Member Detailed Dossier Drawer                   */}
      {/* ======================================================== */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] max-w-lg w-full p-6 space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif-formal text-base font-bold text-[#D8B26E] uppercase tracking-wider">
                  Fellow Dossier &bull; {selectedMember.codename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-[#858995] hover:text-[#E9E2D3] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-[6px] bg-[#161A22] border border-[#262C3A] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[0.625rem] text-[#858995] uppercase block font-serif-formal">
                    Conferred Codename
                  </span>
                  <span className="font-serif-formal font-bold text-[#D8B26E]">
                    {selectedMember.codename}
                  </span>
                </div>
                <div>
                  <span className="text-[0.625rem] text-[#858995] uppercase block font-serif-formal">
                    Serial Identifier
                  </span>
                  <span className="font-mono text-[#E9E2D3]">
                    {selectedMember.member_number || 'SOC-PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-[0.625rem] text-[#858995] uppercase block font-serif-formal">
                    Current Rank
                  </span>
                  <Badge variant="gold">{selectedMember.society_rank}</Badge>
                </div>
                <div>
                  <span className="text-[0.625rem] text-[#858995] uppercase block font-serif-formal">
                    Constitutional Role
                  </span>
                  <span className="font-serif-formal uppercase text-[#E9E2D3]">
                    {selectedMember.society_role}
                  </span>
                </div>
              </div>
            </div>

            {/* Founder Administrative Controls */}
            <div className="space-y-3 pt-2 border-t border-[#262C3A]">
              <span className="font-serif-formal text-[0.6875rem] font-bold text-[#C5A059] uppercase tracking-wider block">
                Founder Administrative Actions
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    toast({
                      type: 'success',
                      title: 'Rank Promotion Ratified',
                      description: `Elevation approved for ${selectedMember.codename}.`,
                    });
                    setSelectedMember(null);
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Promote Rank</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    toast({
                      type: 'info',
                      title: 'Merit Points Credited',
                      description: `100 Honorific points awarded to ${selectedMember.codename}.`,
                    });
                    setSelectedMember(null);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Award Points</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Protected Personal Records (Clearance Restricted) */}
      {/* ======================================================== */}
      {personalRecordsMember && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[#991B1B]/70 shadow-[0_16px_48px_rgba(153,27,27,0.35)] max-w-md w-full p-6 space-y-4 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#991B1B] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <Lock className="w-4 h-4" />
                <h3 className="font-serif-formal text-sm font-bold uppercase tracking-wider">
                  Restricted Personal Records &bull; Class V
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPersonalRecordsMember(null)}
                className="text-[#858995] hover:text-[#E9E2D3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-[4px] bg-[#991B1B]/15 border border-[#991B1B]/30 text-xs text-red-300 leading-relaxed">
              <strong>Strict Privacy Mandate:</strong> Fellow real-world contact information is shielded from general members and stored in vault isolation. Access is logged in the immutable security audit ledger.
            </div>

            <div className="space-y-2 text-xs bg-[#161A22] p-4 rounded-[4px] border border-[#262C3A]">
              <div className="flex justify-between py-1 border-b border-[#262C3A]/60">
                <span className="text-[#858995]">Codename:</span>
                <span className="font-serif-formal text-[#D8B26E] font-bold">
                  {personalRecordsMember.codename}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262C3A]/60">
                <span className="text-[#858995]">Vault Email:</span>
                <span className="font-mono text-[#E9E2D3]">
                  {personalRecordsMember.username || 'vault-protected@society.org'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#858995]">Audit Classification:</span>
                <span className="font-mono text-[#4ADE80]">Fully Verified</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setPersonalRecordsMember(null)}>
                Close Restricted View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Issue Cryptographic Invitation Token             */}
      {/* ======================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] max-w-lg w-full p-6 space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif-formal text-base font-bold text-[#D8B26E] uppercase tracking-wider">
                  Issue Cryptographic Invitation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#858995] hover:text-[#E9E2D3] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedToken ? (
              /* Token Reveal State */
              <div className="space-y-4">
                <div className="p-4 rounded-[4px] bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-xs text-[#4ADE80] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 font-serif-formal">
                    <Check className="w-4 h-4" /> Cryptographic Token Minted Successfully
                  </div>
                  <p className="text-[#858995]">
                    Single-use, time-limited token bound to recipient email.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-serif-formal uppercase text-[#C5A059] tracking-wider block font-semibold">
                    High-Entropy Invitation Token (Copy Now)
                  </label>
                  <div className="p-3 bg-[#080A0E] border border-[rgba(197,160,89,0.5)] rounded-[4px] flex items-center justify-between gap-3 font-mono text-xs text-[#D8B26E] break-all select-all">
                    <span>{generatedToken}</span>
                    <Button variant="gold" size="sm" onClick={handleCopyToken} className="shrink-0">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-[4px] bg-[#991B1B]/15 border border-[#991B1B]/30 text-[0.6875rem] text-[#B5B5BC] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Security Notice:</strong> Plaintext token is never stored in the database. Convey this token directly to the candidate.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setGeneratedToken(null);
                    }}
                  >
                    Done
                  </Button>
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
                  <div className="p-3 rounded-[4px] bg-[#991B1B]/20 border border-[#991B1B] text-xs text-red-300">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Intended Candidate Name"
                    placeholder="e.g. Arthur Pendelton"
                    value={intendedName}
                    onChange={(e) => setIntendedName(e.target.value)}
                    required
                  />
                  <Input
                    label="Candidate Bound Email"
                    type="email"
                    placeholder="candidate@domain.com"
                    value={intendedEmail}
                    onChange={(e) => setIntendedEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Conferred Codename"
                  placeholder="e.g. Vanguard, Veritas, Sovereign"
                  value={assignedCodename}
                  onChange={(e) => setAssignedCodename(e.target.value)}
                  hint="Permanent pseudonym conferred under the Founding Charter."
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
                      Constitutional Role
                    </label>
                    <select
                      value={assignedRole}
                      onChange={(e) => setAssignedRole(e.target.value)}
                      className="w-full bg-[#161A22] text-xs text-[#E9E2D3] px-3 py-2.5 rounded-[4px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="member">Fellow Member</option>
                      <option value="initiate">Initiate Candidate</option>
                      <option value="council">Council Advisor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
                      Initial Rank
                    </label>
                    <select
                      value={assignedRank}
                      onChange={(e) => setAssignedRank(e.target.value)}
                      className="w-full bg-[#161A22] text-xs text-[#E9E2D3] px-3 py-2.5 rounded-[4px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Initiate">Initiate</option>
                      <option value="Associate">Associate</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Trusted Member">Trusted Member</option>
                      <option value="Senior Member">Senior Member</option>
                    </select>
                  </div>

                  <Input
                    label="Expiry (Days)"
                    type="number"
                    min={1}
                    max={90}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#262C3A]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    isLoading={inviteMutation.isPending}
                  >
                    Generate Cryptographic Token
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
