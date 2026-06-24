-- FitOS — Supabase Auth + Multi-Trainer Setup
-- Run this once in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Trainer profiles table (one row per authenticated user)
create table if not exists fitos_trainer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  gym text default '',
  role text default '',
  specialties text[] default '{}',
  created_at timestamptz default now()
);

-- If the table already existed without the role column, add it:
alter table fitos_trainer_profiles add column if not exists role text default '';

-- 2. Add trainer_id column to all data tables
alter table fitos_clients  add column if not exists trainer_id uuid references auth.users(id);
alter table fitos_sessions add column if not exists trainer_id uuid references auth.users(id);
alter table fitos_classes  add column if not exists trainer_id uuid references auth.users(id);
alter table fitos_programs add column if not exists trainer_id uuid references auth.users(id);
alter table fitos_programs add column if not exists warmup jsonb default '[]';
alter table fitos_formats  add column if not exists trainer_id uuid references auth.users(id);

-- 2b. Exercise Catalog (shared library — also stores custom warmup movements so
--     they persist long-term and resurface as suggestions in the warmup pickers).
--     Custom warmups are saved here tagged by `purpose`
--     (Stretch / Mobility / Foam Rolling / Sport Specific).
--     Created here BEFORE the RLS/policy steps below, which reference it.
create table if not exists fitos_catalog (
  id text primary key,
  name text not null,
  category text default 'Strength',
  muscles text[] default '{}',
  equipment text default 'Barbell',
  difficulty text default 'Intermediate',
  purpose text default '',
  instructions text default '',
  video_url text default '',
  trainer_notes text default '',
  tags text[] default '{}',
  photo_base64 text default '',
  created_at timestamptz default now()
);

-- Backfill any missing columns on an existing fitos_catalog table.
-- `purpose` is what lets custom warmup movements save long-term and reappear
-- in the warmup pickers — add it first if you previously lacked it.
alter table fitos_catalog add column if not exists name          text;
alter table fitos_catalog add column if not exists category      text default 'Strength';
alter table fitos_catalog add column if not exists muscles       text[] default '{}';
alter table fitos_catalog add column if not exists equipment     text default 'Barbell';
alter table fitos_catalog add column if not exists difficulty    text default 'Intermediate';
alter table fitos_catalog add column if not exists purpose       text default '';
alter table fitos_catalog add column if not exists instructions  text default '';
alter table fitos_catalog add column if not exists video_url     text default '';
alter table fitos_catalog add column if not exists trainer_notes text default '';
alter table fitos_catalog add column if not exists tags          text[] default '{}';
alter table fitos_catalog add column if not exists photo_base64  text default '';
alter table fitos_catalog add column if not exists created_at    timestamptz default now();

-- 3. Enable Row Level Security on all tables
alter table fitos_trainer_profiles enable row level security;
alter table fitos_clients           enable row level security;
alter table fitos_sessions          enable row level security;
alter table fitos_classes           enable row level security;
alter table fitos_programs          enable row level security;
alter table fitos_formats           enable row level security;
alter table fitos_catalog           enable row level security;

-- 4. Drop old open policies (if they exist)
drop policy if exists "public_all" on fitos_clients;
drop policy if exists "public_all" on fitos_sessions;
drop policy if exists "public_all" on fitos_classes;
drop policy if exists "public_all" on fitos_programs;
drop policy if exists "public_all" on fitos_formats;
drop policy if exists "public_all" on fitos_catalog;

-- 5. Trainer data: each trainer sees/edits only their own rows
create policy "trainer_own" on fitos_clients
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

create policy "trainer_own" on fitos_sessions
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

create policy "trainer_own" on fitos_classes
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

create policy "trainer_own" on fitos_programs
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

create policy "trainer_own" on fitos_formats
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

-- 6. Trainer profiles: each user manages their own profile only
create policy "own_profile" on fitos_trainer_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- 7. Exercise catalog: shared — any authenticated user can read/write
drop policy if exists "catalog_authenticated" on fitos_catalog;
create policy "catalog_authenticated" on fitos_catalog
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Reusable Workouts (standalone, droppable into programs / loadable into sessions)
create table if not exists fitos_workouts (
  id text primary key,
  name text not null,
  focus text default '',
  warmup jsonb default '[]',
  exercises jsonb default '[]',
  trainer_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table fitos_workouts add column if not exists trainer_id uuid references auth.users(id);
alter table fitos_workouts enable row level security;
drop policy if exists "public_all" on fitos_workouts;
create policy "trainer_own" on fitos_workouts
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GOOGLE OAUTH (manual step — do this in the Supabase Dashboard):
-- Authentication → Providers → Google → Enable
-- Paste in your Google OAuth Client ID and Secret
-- Add your app URL to "Redirect URLs" in Authentication → URL Configuration
-- ─────────────────────────────────────────────────────────────────────────────
