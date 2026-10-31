-- ====================================================================
-- REAL-TIME WEB CHAT APPLICATION - DATABASE SCHEMA & POLICIES
-- Supabase PostgreSQL Migration
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- 7. AUTOMATIC USER PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_uname TEXT;
BEGIN
    raw_uname := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    
    -- Ensure uniqueness if username already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = raw_uname) THEN
        raw_uname := raw_uname || '_' || substr(NEW.id::text, 1, 6);
    END IF;

    INSERT INTO public.profiles (id, username, email, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        raw_uname,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. TRIGGER TO UPDATE CONVERSATION updated_at ON NEW MESSAGE
CREATE OR REPLACE FUNCTION public.handle_message_sent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_message_sent();

-- 9. STORED FUNCTION: GET OR CREATE 1-ON-1 CONVERSATION (PREVENTS DUPLICATES)
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user2_id UUID)
RETURNS UUID AS $$
DECLARE
    v_user1_id UUID := auth.uid();
    v_conversation_id UUID;
BEGIN
    IF v_user1_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF v_user1_id = p_user2_id THEN
        RAISE EXCEPTION 'Cannot start conversation with yourself';
    END IF;

    -- Check if both users already share a 2-person conversation
    SELECT cp1.conversation_id INTO v_conversation_id
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = v_user1_id 
      AND cp2.user_id = p_user2_id
      AND (
          SELECT COUNT(*) 
          FROM public.conversation_participants sub_cp 
          WHERE sub_cp.conversation_id = cp1.conversation_id
      ) = 2
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
        RETURN v_conversation_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations (id, created_at, updated_at)
    VALUES (gen_random_uuid(), NOW(), NOW())
    RETURNING id INTO v_conversation_id;

    -- Insert both participants
    INSERT INTO public.conversation_participants (conversation_id, user_id, joined_at)
    VALUES
        (v_conversation_id, v_user1_id, NOW()),
        (v_conversation_id, p_user2_id, NOW());

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CONVERSATIONS RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.conversations.id
          AND cp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
CREATE POLICY "Users can update conversations they participate in"
ON public.conversations FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.conversations.id
          AND cp.user_id = auth.uid()
    )
);

-- CONVERSATION PARTICIPANTS RLS
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.conversation_participants.conversation_id
          AND cp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert participants" ON public.conversation_participants;
CREATE POLICY "Users can insert participants"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.conversation_participants.conversation_id
          AND cp.user_id = auth.uid()
    )
);

-- MESSAGES RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view conversation messages" ON public.messages;
CREATE POLICY "Participants can view conversation messages"
ON public.messages FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.messages.conversation_id
          AND cp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.messages.conversation_id
          AND cp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Participants can update messages in their conversations" ON public.messages;
CREATE POLICY "Participants can update messages in their conversations"
ON public.messages FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.messages.conversation_id
          AND cp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = public.messages.conversation_id
          AND cp.user_id = auth.uid()
    )
);

-- 11. ENABLE SUPABASE REALTIME
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
END $$;

-- 12. STORAGE BUCKET FOR AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can update avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');
