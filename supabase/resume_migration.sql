-- ============================================================================
-- LUMINO — Phase 3: Resume Intelligence Migration
-- Run AFTER setup.sql (profiles table must exist first).
-- Safe to re-run: uses IF NOT EXISTS guards.
-- ============================================================================

-- ── 1. resumes table ─────────────────────────────────────────────────────────
create table if not exists public.resumes (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  file_name           text        not null,
  file_size_bytes     integer,
  mime_type           text,
  storage_path        text,                          -- path in 'resumes' Storage bucket
  text_preview        text,                          -- first 500 chars of extracted text
  status              text        not null default 'pending'
                                  check (status in ('pending', 'analysed', 'failed')),
  latest_analysis_id  uuid,                          -- set after analysis completes
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.resumes is
  'Uploaded resume metadata. Actual files live in the private resumes Storage bucket.';

-- ── 2. resume_analyses table ─────────────────────────────────────────────────
create table if not exists public.resume_analyses (
  id            uuid        primary key default gen_random_uuid(),
  resume_id     uuid        not null references public.resumes(id) on delete cascade,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  overall_score integer     check (overall_score between 0 and 100),
  analysis_json jsonb       not null,                -- full structured Gemini response
  created_at    timestamptz not null default now()
);

comment on table public.resume_analyses is
  'AI analysis results for each resume. Stored as structured JSON.';

-- ── 3. Foreign key from resumes.latest_analysis_id ───────────────────────────
-- Add deferred FK so we can insert the resume row before the analysis exists
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'resumes'
    and   constraint_name = 'resumes_latest_analysis_id_fkey'
  ) then
    alter table public.resumes
      add constraint resumes_latest_analysis_id_fkey
      foreign key (latest_analysis_id) references public.resume_analyses(id)
      on delete set null
      deferrable initially deferred;
  end if;
end;
$$;

-- ── 4. Row Level Security ─────────────────────────────────────────────────────
alter table public.resumes          enable row level security;
alter table public.resume_analyses  enable row level security;

-- resumes: users can only see and modify their own rows
create policy if not exists "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy if not exists "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- resume_analyses: users can only see their own analysis results
create policy if not exists "Users can view own analyses"
  on public.resume_analyses for select
  using (auth.uid() = user_id);

-- ── 5. Auto-update updated_at on resumes ─────────────────────────────────────
drop trigger if exists resumes_set_updated_at on public.resumes;

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row
  execute procedure public.set_updated_at();    -- reuse function from setup.sql

-- ── 6. Indexes for common queries ─────────────────────────────────────────────
create index if not exists idx_resumes_user_id
  on public.resumes (user_id, created_at desc);

create index if not exists idx_analyses_resume_id
  on public.resume_analyses (resume_id);

create index if not exists idx_analyses_user_id
  on public.resume_analyses (user_id, created_at desc);

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Next: create the 'resumes' Storage bucket in Supabase Dashboard:
--   Storage → New bucket → Name: "resumes" → Private (NOT public)
