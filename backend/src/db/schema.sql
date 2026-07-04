-- AlgoLens Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Problems ──────────────────────────────────────────────────────────────────
create table if not exists problems (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  statement    text not null,
  tags         text[] not null default '{}',
  difficulty   text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  is_curated   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists problems_difficulty_idx on problems(difficulty);
create index if not exists problems_tags_idx on problems using gin(tags);

-- ── Approaches ────────────────────────────────────────────────────────────────
create table if not exists approaches (
  id                  uuid primary key default uuid_generate_v4(),
  problem_id          uuid references problems(id) on delete cascade,
  language            text not null,
  approach_name       text not null,
  explanation         text not null,
  algorithm_steps     text[] not null default '{}',
  code                text not null,
  dry_run_trace       text not null,
  time_complexity     text not null,
  time_justification  text,
  space_complexity    text not null,
  space_justification text,
  pros                text[] not null default '{}',
  cons                text[] not null default '{}',
  best_use_case       text,
  is_verified         boolean not null default false,
  complexity_verified boolean,
  time_flag           text,
  space_flag          text,
  created_at          timestamptz not null default now()
);

create index if not exists approaches_problem_lang_idx on approaches(problem_id, language);

-- ── Interview Questions ───────────────────────────────────────────────────────
create table if not exists interview_questions (
  id            uuid primary key default uuid_generate_v4(),
  approach_id   uuid references approaches(id) on delete cascade,
  question_text text not null,
  created_at    timestamptz not null default now()
);

create index if not exists interview_q_approach_idx on interview_questions(approach_id);

-- ── Favorites ─────────────────────────────────────────────────────────────────
create table if not exists favorites (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  approach_id  uuid not null references approaches(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(user_id, approach_id)
);

create index if not exists favorites_user_idx on favorites(user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Problems and approaches are public (read)
alter table problems enable row level security;
create policy "problems_public_read" on problems for select using (true);

alter table approaches enable row level security;
create policy "approaches_public_read" on approaches for select using (true);
create policy "approaches_service_write" on approaches for insert with check (true);

alter table interview_questions enable row level security;
create policy "questions_public_read" on interview_questions for select using (true);
create policy "questions_service_write" on interview_questions for insert with check (true);

-- Favorites: users can only see and modify their own
alter table favorites enable row level security;
create policy "favorites_own_read" on favorites for select using (auth.uid() = user_id);
create policy "favorites_own_insert" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites_own_delete" on favorites for delete using (auth.uid() = user_id);
