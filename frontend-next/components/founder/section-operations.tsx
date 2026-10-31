'use client';

import React, { useState } from 'react';
import {
  Target,
  Award,
  CheckCircle,
  Clock,
  ShieldCheck,
  Plus,
  FileCheck,
  X,
  FileText,
  User,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface Directive {
  code: string;
  title: string;
  category: string;
  status: 'Active' | 'Under Review' | 'Completed' | 'Draft';
  clearance: string;
  points: number;
  submissionsCount: number;
  deadline: string;
  description: string;
}

const INITIAL_DIRECTIVES: Directive[] = [
  {
    code: 'DIR-2026-001',
    title: 'Forensic Audit of Public Infrastructure Grants',
    category: 'Public Welfare Investigation',
    status: 'Active',
    clearance: 'Fellow Member',
    points: 250,
    submissionsCount: 3,
    deadline: '15 Nov 2026',
    description: 'Systematically compile and verify open municipal fiscal disclosures across three regional administrative jurisdictions.',
  },
  {
    code: 'DIR-2026-002',
    title: 'Cryptographic Security Analysis of Open Ledger Implementations',
    category: 'Cybersecurity Research',
    status: 'Under Review',
    clearance: 'Specialist Rank',
    points: 500,
    submissionsCount: 5,
    deadline: '05 Nov 2026',
    description: 'Audit public-interest cryptographic implementations for timing vulnerabilities and timing-safe verification guarantees.',
  },
  {
    code: 'DIR-2026-003',
    title: 'Scholarly Translation and Annotation of Classical Inscriptions',
    category: 'Intellectual Development',
    status: 'Active',
    clearance: 'Associate Fellow',
    points: 150,
    submissionsCount: 1,
    deadline: '30 Nov 2026',
    description: 'Transcribe, translate, and cross-reference newly catalogued classical inscriptions with established archival repositories.',
  },
  {
    code: 'DIR-2026-004',
    title: 'Humanitarian Supply Chain Continuity Mapping',
    category: 'Humanitarian Initiatives',
    status: 'Completed',
    clearance: 'Trusted Member',
    points: 350,
    submissionsCount: 8,
    deadline: '20 Oct 2026',
    description: 'Model resilient decentralized distribution corridors for humanitarian aid across emergency logistics nodes.',
  },
];

export function SectionOperations() {
  const { toast } = useToast();
  const [directives, setDirectives] = useState<Directive[]>(INITIAL_DIRECTIVES);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'review' | 'completed'>('all');

  // Modal: Commission New Directive
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Public Welfare Investigation');
  const [newClearance, setNewClearance] = useState('Fellow Member');
  const [newPoints, setNewPoints] = useState(200);
  const [newDeadline, setNewDeadline] = useState('30 Nov 2026');
  const [newDescription, setNewDescription] = useState('');

  // Modal: Review Submissions
  const [reviewingDirective, setReviewingDirective] = useState<Directive | null>(null);

  const handleCommissionDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newDirective: Directive = {
      code: `DIR-2026-00${directives.length + 1}`,
      title: newTitle.trim(),
      category: newCategory,
      status: 'Active',
      clearance: newClearance,
      points: newPoints,
      submissionsCount: 0,
      deadline: newDeadline,
      description: newDescription.trim(),
    };

    setDirectives([newDirective, ...directives]);
    setIsCommissionModalOpen(false);
    setNewTitle('');
    setNewDescription('');

    toast({
      type: 'success',
      title: 'Directive Commissioned',
      description: `${newDirective.code} is now active and visible to authorized Fellows.`,
    });
  };

  const filteredDirectives = directives.filter((d) => {
    if (activeTab === 'active') return d.status === 'Active';
    if (activeTab === 'review') return d.status === 'Under Review';
    if (activeTab === 'completed') return d.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262C3A]/70 pb-6">
        <div>
          <span className="text-[0.6875rem] font-serif-formal tracking-widest text-[#C5A059] uppercase font-semibold">
            Operational Directives &bull; Section 03
          </span>
          <h1 className="font-serif-formal text-2xl font-bold tracking-wider text-[#D8B26E] mt-1 uppercase">
            Operations & Challenges
          </h1>
          <p className="text-xs text-[#858995] mt-0.5">
            Commission Public Welfare Inquiries, Strategic Challenges & Ratify Submissions
          </p>
        </div>

        <Button variant="gold" size="md" onClick={() => setIsCommissionModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Commission New Directive</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#161A22] rounded-[4px] border border-[#262C3A] w-fit text-xs font-serif-formal uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-[3px] transition-colors ${
            activeTab === 'all'
              ? 'bg-[#C5A059] text-[#080A0E] font-bold'
              : 'text-[#858995] hover:text-[#E9E2D3]'
          }`}
        >
          All Operations ({directives.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1.5 rounded-[3px] transition-colors ${
            activeTab === 'active'
              ? 'bg-[#C5A059] text-[#080A0E] font-bold'
              : 'text-[#858995] hover:text-[#E9E2D3]'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`px-3 py-1.5 rounded-[3px] transition-colors ${
            activeTab === 'review'
              ? 'bg-[#C5A059] text-[#080A0E] font-bold'
              : 'text-[#858995] hover:text-[#E9E2D3]'
          }`}
        >
          Under Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-[3px] transition-colors ${
            activeTab === 'completed'
              ? 'bg-[#C5A059] text-[#080A0E] font-bold'
              : 'text-[#858995] hover:text-[#E9E2D3]'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Directives Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDirectives.map((d) => (
          <div
            key={d.code}
            className="p-5 rounded-[6px] bg-[#0F1218] border border-[#262C3A] flex flex-col justify-between space-y-4 hover:border-[rgba(197,160,89,0.35)] transition-all shadow-md relative overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#C5A059] font-bold tracking-wider">
                  {d.code}
                </span>
                <Badge
                  variant={
                    d.status === 'Active'
                      ? 'active'
                      : d.status === 'Under Review'
                      ? 'pending'
                      : 'neutral'
                  }
                >
                  {d.status}
                </Badge>
              </div>

              <h3 className="font-serif-formal text-sm font-bold text-[#E9E2D3] leading-snug">
                {d.title}
              </h3>

              <div className="text-[0.6875rem] text-[#C5A059] font-serif-formal uppercase tracking-wider">
                {d.category}
              </div>

              <p className="text-xs text-[#858995] leading-relaxed line-clamp-3">
                {d.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#262C3A]/70 text-xs">
              <div className="flex items-center justify-between text-[#858995] font-mono text-[0.6875rem]">
                <span>CLEARANCE: {d.clearance}</span>
                <span>DEADLINE: {d.deadline}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[#D8B26E] font-mono font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{d.points} PTS</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setReviewingDirective(d)}
                >
                  <span>Review Submissions ({d.submissionsCount})</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* MODAL: Commission New Directive                          */}
      {/* ======================================================== */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] max-w-lg w-full p-6 space-y-5 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif-formal text-base font-bold text-[#D8B26E] uppercase tracking-wider">
                  Commission Operational Directive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommissionModalOpen(false)}
                className="text-[#858995] hover:text-[#E9E2D3] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCommissionDirective} className="space-y-4">
              <Input
                label="Directive Title"
                placeholder="e.g. Municipal Data Transparency Audit"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
                    Operational Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#161A22] text-xs text-[#E9E2D3] px-3 py-2.5 rounded-[4px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Public Welfare Investigation">Public Welfare Investigation</option>
                    <option value="Cybersecurity Research">Cybersecurity Research</option>
                    <option value="Intellectual Development">Intellectual Development</option>
                    <option value="Humanitarian Initiatives">Humanitarian Initiatives</option>
                    <option value="Institutional Governance">Institutional Governance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
                    Minimum Clearance Required
                  </label>
                  <select
                    value={newClearance}
                    onChange={(e) => setNewClearance(e.target.value)}
                    className="w-full bg-[#161A22] text-xs text-[#E9E2D3] px-3 py-2.5 rounded-[4px] border border-[#262C3A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Initiate Candidate">Initiate Candidate</option>
                    <option value="Fellow Member">Fellow Member</option>
                    <option value="Associate Fellow">Associate Fellow</option>
                    <option value="Specialist Rank">Specialist Rank</option>
                    <option value="Trusted Member">Trusted Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Merit Honorific Points"
                  type="number"
                  min={50}
                  max={2500}
                  value={newPoints}
                  onChange={(e) => setNewPoints(parseInt(e.target.value) || 100)}
                  required
                />
                <Input
                  label="Target Conclave Deadline"
                  type="text"
                  placeholder="e.g. 15 Dec 2026"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                />
              </div>

              <Textarea
                label="Operational Specification & Objectives"
                placeholder="State the constitutional objective, methodologies permitted, and research parameters..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-[#262C3A]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCommissionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold">
                  Ratify & Commission Directive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Review Submissions for Directive                 */}
      {/* ======================================================== */}
      {reviewingDirective && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] max-w-lg w-full p-6 space-y-4 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div>
                <span className="font-mono text-[0.625rem] text-[#C5A059]">
                  {reviewingDirective.code} &bull; Submissions
                </span>
                <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase">
                  {reviewingDirective.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingDirective(null)}
                className="text-[#858995] hover:text-[#E9E2D3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[4px] bg-[#161A22] border border-[#262C3A] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="font-serif-formal font-bold text-[#E9E2D3]">
                      Submitted by Fellow &apos;Vanguard&apos;
                    </span>
                  </div>
                  <Badge variant="pending">Awaiting Review</Badge>
                </div>
                <p className="text-[0.6875rem] text-[#858995] leading-relaxed">
                  Comprehensive 18-page dossier detailing municipal procurement discrepancy records and verifiable ledger anomalies.
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-[#262C3A]/60">
                  <span className="font-mono text-[0.625rem] text-[#858995]">
                    DOC-HASH: 8f2b...39e1
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="burgundy"
                      size="sm"
                      onClick={() => {
                        toast({
                          type: 'error',
                          title: 'Submission Rejected',
                          description: 'Feedback dispatched to Fellow.',
                        });
                        setReviewingDirective(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        toast({
                          type: 'success',
                          title: 'Submission Approved & Ratified',
                          description: `+${reviewingDirective.points} Merit points credited to Fellow Vanguard.`,
                        });
                        setReviewingDirective(null);
                      }}
                    >
                      Approve & Credit Points
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReviewingDirective(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
