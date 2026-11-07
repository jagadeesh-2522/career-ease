-- ============================================================================
-- LUMINO — Supabase Database Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Safe to run once on a fresh project.
-- Tables and triggers are created with IF NOT EXISTS guards.
-- ============================================================================

-- ── 1. profiles table ───────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text        not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public user profile. One row per authenticated user, linked to auth.users.';

-- ── 2. Row Level Security ────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can only SELECT their own profile row
do $$
begin
  if not exists (
    select 1 from pg_policies
    where  schemaname = 'public'
    and    tablename  = 'profiles'
    and    policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;
end;
$$;

-- Users can only UPDATE their own profile row
do $$
begin
  if not exists (
    select 1 from pg_policies
    where  schemaname = 'public'
    and    tablename  = 'profiles'
    and    policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end;
$$;

-- ── 3. Auto-create profile on new user sign-up ───────────────────────────────
--
-- This trigger fires after every INSERT into auth.users, which covers:
--   • Email + password registration
--   • Google OAuth (and any other OAuth provider)
--
-- raw_user_meta_data contains the data passed during signUp()
-- as well as the data returned by the OAuth provider.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;   -- idempotent: skip if profile already exists
  return new;
end;
$$;

-- Drop trigger first so this script is safe to re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ── 4. Auto-update updated_at timestamp ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

-- ── Done ────────────────────────────────────────────────────────────────────
-- Verify by running:
--   select * from public.profiles;
-- After a test sign-up, a row should appear automatically.
