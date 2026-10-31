export type SocietyRole = 'founder' | 'council' | 'member' | 'initiate';

export type SocietyRank =
  | 'Initiate'
  | 'Associate'
  | 'Contributor'
  | 'Trusted Member'
  | 'Senior Member'
  | 'Round Table Candidate'
  | 'Round Table Member'
  | 'Founder';

export interface MemberProfile {
  id: string;
  codename: string | null;
  member_number: string | null;
  society_role: SocietyRole;
  society_rank: SocietyRank;
  designation?: string | null;
  points: number;
  progression_level: number;
  is_hall_of_legends: boolean;
  induction_date: string | null;
  is_active: boolean;
  created_at?: string;
  avatar_url?: string;
}

export interface ConversationPartner {
  id: string;
  username?: string;
  codename?: string;
  email?: string;
  avatar_url?: string;
  society_role?: SocietyRole;
  society_rank?: SocietyRank;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  partner?: ConversationPartner | null;
  latest_message?: MessageItem | null;
  unread_count?: number;
}

export interface InvitationVerifyResult {
  valid: boolean;
  assigned_codename?: string;
  masked_email?: string;
  assigned_role?: SocietyRole;
  assigned_rank?: SocietyRank;
  message?: string;
}

export interface CentralCommandMetrics {
  total_members: number;
  active_members: number;
  legends_count: number;
  pending_invitations?: number;
  active_operations?: number;
  system_status?: string;
}

export interface AdministrativeAuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_resource: string;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
