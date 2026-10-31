-- ====================================================================
-- PRIVATE SOCIETY PLATFORM — PHASE 1 MIGRATION
-- Non-Destructive Extension: Roles, Cryptographic Invites & Auditing
-- ====================================================================

-- 1. EXTENSIONS & CUSTOM ENUM TYPES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE public.society_role AS ENUM ('founder', 'council', 'member', 'initiate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.society_rank AS ENUM (
        'Initiate',
        'Associate',
        'Contributor',
        'Trusted Member',
        'Senior Member',
        'Round Table Candidate',
        'Round Table Member',
        'Founder'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'redeemed', 'revoked', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. EXTEND EXISTING PROFILES TABLE WITH SOCIETY ATTRIBUTES
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS codename TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS member_number TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS society_role public.society_role NOT NULL DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS society_rank public.society_rank NOT NULL DEFAULT 'Initiate',
    ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Society Member',
    ADD COLUMN IF NOT EXISTS points INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS progression_level INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_hall_of_legends BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS induction_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_codename ON public.profiles(codename);
CREATE INDEX IF NOT EXISTS idx_profiles_society_role ON public.profiles(society_role);
CREATE INDEX IF NOT EXISTS idx_profiles_society_rank ON public.profiles(society_rank);

-- 3. CRYPTOGRAPHIC INVITATIONS TABLE (Single-use, Hashed Tokens)
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_token_hash TEXT UNIQUE NOT NULL,
    intended_name TEXT NOT NULL,
    intended_email TEXT NOT NULL,
    assigned_codename TEXT UNIQUE NOT NULL,
    assigned_role public.society_role NOT NULL DEFAULT 'member',
    assigned_rank public.society_rank NOT NULL DEFAULT 'Initiate',
    invitation_status public.invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    redeemed_at TIMESTAMPTZ,
    redeemed_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON public.invitations(invitation_token_hash);
CREATE INDEX IF NOT EXISTS idx_invitations_intended_email ON public.invitations(LOWER(intended_email));
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(invitation_status);

-- 4. SEGREGATED PRIVATE PERSONAL RECORDS (Strict Founder-Only Access)
CREATE TABLE IF NOT EXISTS public.member_private_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    real_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_private_records_member_id ON public.member_private_records(member_id);

-- 5. TAMPER-EVIDENT ADMINISTRATIVE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.administrative_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.administrative_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.administrative_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.administrative_audit_logs(created_at DESC);

-- 6. SECURITY HELPER FUNCTION (Founder Verification)
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND society_role = 'founder' 
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. ATOMIC INVITATION REDEMPTION STORED PROCEDURE
CREATE OR REPLACE FUNCTION public.redeem_invitation_atomic(
    p_token_hash TEXT,
    p_user_id UUID,
    p_email TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    assigned_codename TEXT,
    assigned_role public.society_role,
    assigned_rank public.society_rank,
    intended_name TEXT
) AS $$
DECLARE
    v_inv RECORD;
    v_member_number TEXT;
BEGIN
    -- 1. Lock the invitation row for update to prevent concurrent race conditions
    SELECT * INTO v_inv
    FROM public.invitations
    WHERE invitation_token_hash = p_token_hash
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid invitation token'::TEXT, NULL::TEXT, NULL::public.society_role, NULL::public.society_rank, NULL::TEXT;
        RETURN;
    END IF;

    IF v_inv.invitation_status <> 'pending' THEN
        RETURN QUERY SELECT FALSE, ('Invitation has already been ' || v_inv.invitation_status::TEXT)::TEXT, NULL::TEXT, NULL::public.society_role, NULL::public.society_rank, NULL::TEXT;
        RETURN;
    END IF;

    IF v_inv.expires_at < NOW() THEN
        UPDATE public.invitations SET invitation_status = 'expired' WHERE id = v_inv.id;
        RETURN QUERY SELECT FALSE, 'Invitation code has expired'::TEXT, NULL::TEXT, NULL::public.society_role, NULL::public.society_rank, NULL::TEXT;
        RETURN;
    END IF;

    IF LOWER(v_inv.intended_email) <> LOWER(p_email) THEN
        RETURN QUERY SELECT FALSE, 'Email address does not match the intended invitee'::TEXT, NULL::TEXT, NULL::public.society_role, NULL::public.society_rank, NULL::TEXT;
        RETURN;
    END IF;

    -- 2. Generate sequential member number
    v_member_number := 'SOC-' || LPAD(((SELECT COUNT(*) FROM public.profiles) + 1)::TEXT, 4, '0');

    -- 3. Atomically mark invitation as redeemed
    UPDATE public.invitations
    SET invitation_status = 'redeemed',
        redeemed_at = NOW(),
        redeemed_by = p_user_id
    WHERE id = v_inv.id;

    -- 4. Update member's public profile with society credentials
    UPDATE public.profiles
    SET codename = v_inv.assigned_codename,
        member_number = v_member_number,
        society_role = v_inv.assigned_role,
        society_rank = v_inv.assigned_rank,
        induction_date = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 5. Insert separate confidential record (accessible only by Founder)
    INSERT INTO public.member_private_records (member_id, real_name, contact_email, notes)
    VALUES (p_user_id, v_inv.intended_name, v_inv.intended_email, 'Redeemed via token hash ' || SUBSTR(p_token_hash, 1, 8) || '...')
    ON CONFLICT (member_id) DO UPDATE
    SET real_name = EXCLUDED.real_name,
        contact_email = EXCLUDED.contact_email;

    -- 6. Record administrative audit log
    INSERT INTO public.administrative_audit_logs (actor_id, action, target_resource, target_id, details)
    VALUES (
        p_user_id,
        'INVITATION_REDEEMED',
        'invitations',
        v_inv.id::TEXT,
        jsonb_build_object(
            'codename', v_inv.assigned_codename,
            'role', v_inv.assigned_role,
            'member_number', v_member_number
        )
    );

    RETURN QUERY SELECT TRUE, 'Success'::TEXT, v_inv.assigned_codename, v_inv.assigned_role, v_inv.assigned_rank, v_inv.intended_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by authenticated members" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated members"
ON public.profiles FOR SELECT TO authenticated
USING (is_active = TRUE);

DROP POLICY IF EXISTS "Members cannot alter society identity" ON public.profiles;
CREATE POLICY "Members cannot alter society identity"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    (
        public.is_founder() OR (
            codename IS NOT DISTINCT FROM (SELECT p.codename FROM public.profiles p WHERE p.id = auth.uid()) AND
            member_number IS NOT DISTINCT FROM (SELECT p.member_number FROM public.profiles p WHERE p.id = auth.uid()) AND
            society_role IS NOT DISTINCT FROM (SELECT p.society_role FROM public.profiles p WHERE p.id = auth.uid()) AND
            society_rank IS NOT DISTINCT FROM (SELECT p.society_rank FROM public.profiles p WHERE p.id = auth.uid()) AND
            points IS NOT DISTINCT FROM (SELECT p.points FROM public.profiles p WHERE p.id = auth.uid()) AND
            progression_level IS NOT DISTINCT FROM (SELECT p.progression_level FROM public.profiles p WHERE p.id = auth.uid()) AND
            is_hall_of_legends IS NOT DISTINCT FROM (SELECT p.is_hall_of_legends FROM public.profiles p WHERE p.id = auth.uid())
        )
    )
);

-- INVITATIONS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founder can manage all invitations" ON public.invitations;
CREATE POLICY "Founder can manage all invitations"
ON public.invitations FOR ALL TO authenticated
USING (public.is_founder())
WITH CHECK (public.is_founder());

-- MEMBER PRIVATE RECORDS
ALTER TABLE public.member_private_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founder can access private member records" ON public.member_private_records;
CREATE POLICY "Founder can access private member records"
ON public.member_private_records FOR ALL TO authenticated
USING (public.is_founder())
WITH CHECK (public.is_founder());

-- ADMINISTRATIVE AUDIT LOGS
ALTER TABLE public.administrative_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founder can view audit logs" ON public.administrative_audit_logs;
CREATE POLICY "Founder can view audit logs"
ON public.administrative_audit_logs FOR SELECT TO authenticated
USING (public.is_founder());

DROP POLICY IF EXISTS "Authenticated processes can insert audit logs" ON public.administrative_audit_logs;
CREATE POLICY "Authenticated processes can insert audit logs"
ON public.administrative_audit_logs FOR INSERT TO authenticated
WITH CHECK (true);
