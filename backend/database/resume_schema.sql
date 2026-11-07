-- =============================================================================
-- LUMINO — Resume Intelligence: Authoritative Schema
-- File: backend/database/resume_schema.sql
--
-- HOW TO RUN
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Open your Supabase project dashboard.
-- 2. Go to  SQL Editor  →  + New query.
-- 3. Paste this entire file and click  Run  (or press Ctrl+Enter).
-- 4. You should see "Success. No rows returned" for each statement.
--
-- PREREQUISITES
-- ─────────────────────────────────────────────────────────────────────────────
-- supabase/setup.sql must have been run first.
-- It defines the  public.set_updated_at()  trigger function used below.
--
-- IDEMPOTENCY
-- ─────────────────────────────────────────────────────────────────────────────
-- Every statement is guarded with  IF NOT EXISTS  or  DO $$ … END $$  checks.
-- Running this file more than once on the same database is safe:
-- existing tables, policies and indexes are never dropped or altered.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1.  resumes  table
-- ---------------------------------------------------------------------------
-- Stores one row per uploaded resume file.
-- The backend inserts a row immediately on upload, then updates
-- status → 'analysed' / 'failed' and latest_analysis_id once Gemini returns.
-- ---------------------------------------------------------------------------
create table if not exists public.resumes (
  id                  uuid          not null default gen_random_uuid(),
  user_id             uuid          not null,
  file_name           text          not null,
  file_size_bytes     bigint        not null,        -- bigint, not integer
  mime_type           text          not null,
  storage_path        text,                          -- NULL until file is stored
  text_preview        text,                          -- first 500 chars of extracted text
  status              text          not null default 'processing'
                                    check (status in ('processing', 'analysed', 'failed')),
  latest_analysis_id  uuid,                          -- FK added below, after resume_analyses exists
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),

  constraint resumes_pkey primary key (id),
  constraint resumes_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade
);

comment on table  public.resumes                  is 'One row per uploaded resume file. Files are stored in the private "resumes" Storage bucket.';
comment on column public.resumes.storage_path     is 'Path within the "resumes" Storage bucket, e.g. "<user_id>/<timestamp>_<filename>".';
comment on column public.resumes.text_preview     is 'First 500 characters of extracted text. Not the full resume content.';
comment on column public.resumes.latest_analysis_id is 'FK to resume_analyses.id — set once analysis completes, nullable until then.';


-- ---------------------------------------------------------------------------
-- 2.  resume_analyses  table
-- ---------------------------------------------------------------------------
-- Stores the full structured JSON analysis returned by Gemini for each resume.
-- A resume can have multiple analyses (if re-uploaded); latest_analysis_id
-- in  resumes  always points to the most recent one.
-- ---------------------------------------------------------------------------
create table if not exists public.resume_analyses (
  id            uuid          not null default gen_random_uuid(),
  resume_id     uuid          not null,
  user_id       uuid          not null,
  overall_score numeric       check (overall_score between 0 and 100),
  analysis_json jsonb         not null,
  created_at    timestamptz   not null default now(),

  constraint resume_analyses_pkey primary key (id),
  constraint resume_analyses_resume_id_fkey
    foreign key (resume_id) references public.resumes (id) on delete cascade,
  constraint resume_analyses_user_id_fkey
    foreign key (user_id)   references auth.users (id)    on delete cascade
);

comment on table  public.resume_analyses              is 'Full AI analysis results per resume. Stored as JSONB.';
comment on column public.resume_analyses.overall_score is 'Gemini-generated quality score 0–100. Not an ATS score.';
comment on column public.resume_analyses.analysis_json is 'Complete validated JSON response from the Gemini service.';


-- ---------------------------------------------------------------------------
-- 3.  resumes.latest_analysis_id  foreign key
-- ---------------------------------------------------------------------------
-- This FK cannot be declared inline in the  CREATE TABLE  above because
-- resume_analyses did not exist yet at that point.
-- The DO block checks for the constraint before adding it, making this
-- safe to re-run on a database where the constraint already exists.
-- The constraint is DEFERRABLE so the backend can insert the resume row
-- first and back-fill latest_analysis_id afterwards in the same transaction.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from   information_schema.table_constraints
    where  table_schema    = 'public'
    and    table_name      = 'resumes'
    and    constraint_name = 'resumes_latest_analysis_id_fkey'
  ) then
    alter table public.resumes
      add constraint resumes_latest_analysis_id_fkey
      foreign key (latest_analysis_id)
      references public.resume_analyses (id)
      on delete set null
      deferrable initially deferred;
  end if;
end;
$$;


-- ---------------------------------------------------------------------------
-- 4.  Row Level Security
-- ---------------------------------------------------------------------------
-- The backend always uses the service-role key which bypasses RLS.
-- These policies protect any future direct queries from the frontend
-- (e.g. via the Supabase JS client) so users can only read their own data.
-- ---------------------------------------------------------------------------
alter table public.resumes          enable row level security;
alter table public.resume_analyses  enable row level security;

-- resumes: authenticated users may SELECT their own rows
do $$
begin
  if not exists (
    select 1 from pg_policies
    where  schemaname = 'public'
    and    tablename  = 'resumes'
    and    policyname = 'resumes: owner can select'
  ) then
    create policy "resumes: owner can select"
      on public.resumes
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;

-- resume_analyses: authenticated users may SELECT their own rows
do $$
begin
  if not exists (
    select 1 from pg_policies
    where  schemaname = 'public'
    and    tablename  = 'resume_analyses'
    and    policyname = 'resume_analyses: owner can select'
  ) then
    create policy "resume_analyses: owner can select"
      on public.resume_analyses
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;

-- Note: INSERT / UPDATE / DELETE are performed exclusively by the backend
-- using the service-role key, so no DML policies are required for those
-- operations from the client side.


-- ---------------------------------------------------------------------------
-- 5.  updated_at trigger on  resumes
-- ---------------------------------------------------------------------------
-- Reuses the  set_updated_at()  function created by  supabase/setup.sql.
-- The DROP … IF EXISTS + CREATE ensures idempotency.
-- ---------------------------------------------------------------------------
drop trigger if exists resumes_set_updated_at on public.resumes;

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row
  execute procedure public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 6.  Indexes
-- ---------------------------------------------------------------------------
-- idx_resumes_user_created  — powers GET /api/resume/list (filter + sort)
-- idx_analyses_resume_id    — powers the nested  resume_analyses()  select
--                             and GET /api/resume/:id/analysis
-- idx_analyses_user_created — powers per-user analysis lookups
-- ---------------------------------------------------------------------------
create index if not exists idx_resumes_user_created
  on public.resumes (user_id, created_at desc);

create index if not exists idx_analyses_resume_id
  on public.resume_analyses (resume_id);

create index if not exists idx_analyses_user_created
  on public.resume_analyses (user_id, created_at desc);


-- =============================================================================
-- VERIFICATION QUERIES
-- Run these separately after the schema is applied to confirm everything exists.
-- =============================================================================
--
--   select table_name
--   from   information_schema.tables
--   where  table_schema = 'public'
--   and    table_name in ('resumes', 'resume_analyses');
--
--   select schemaname, tablename, policyname
--   from   pg_policies
--   where  tablename in ('resumes', 'resume_analyses');
--
--   select indexname
--   from   pg_indexes
--   where  tablename in ('resumes', 'resume_analyses');
--
-- =============================================================================
