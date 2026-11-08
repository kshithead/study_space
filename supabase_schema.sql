-- ==============================================================================
-- StudySpace Cloud Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Users Table (Stores user accounts, credentials, and profile state)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT DEFAULT '',
    learning_track TEXT DEFAULT 'General Studies',
    streak INT DEFAULT 1,
    level INT DEFAULT 1,
    level_name TEXT DEFAULT 'Explorer',
    xp INT DEFAULT 150,
    xp_to_next INT DEFAULT 1000,
    weekly_goal_hours NUMERIC DEFAULT 6.0,
    hours_this_week NUMERIC DEFAULT 0.0,
    auth_provider TEXT DEFAULT 'local',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by email during login
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Study Materials Table (Tracks uploaded PDFs and public URLs)
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course TEXT NOT NULL DEFAULT 'Academic Study Material',
    file_url TEXT NOT NULL,
    file_path TEXT,
    file_size TEXT DEFAULT '1.2 MB',
    total_pages INT DEFAULT 1,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_user ON public.study_materials(user_id);

-- 3. Pre-seed Default Demo Student Account
INSERT INTO public.users (
    id, email, password_hash, full_name, avatar, bio, learning_track, streak, level, level_name, xp, xp_to_next
) VALUES (
    'usr_demo_alex',
    'alex.carter@studyspace.app',
    'studyspace2026',
    'Alex Carter',
    '/images/default-avatar.svg',
    'Computer Science senior specializing in AI systems and distributed learning architectures.',
    'Computer Science & AI',
    7,
    4,
    'Scholar',
    2850,
    4000
) ON CONFLICT (email) DO NOTHING;

-- 4. Enable Public Read & Insert Policies for Simple Access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated reads/writes for major project evaluation
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public select on study_materials" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert on study_materials" ON public.study_materials FOR INSERT WITH CHECK (true);

-- 5. Storage Bucket for PDF Files
-- Creates the 'study-materials' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: allow anyone to download, and anyone with anon key to upload
CREATE POLICY "Public Download Study Materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Allow Upload Study Materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-materials');
