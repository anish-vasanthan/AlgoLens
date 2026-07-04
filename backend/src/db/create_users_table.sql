-- Run this in your Supabase SQL Editor
-- Creates the app_users table for storing visitor profiles

create table if not exists app_users (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,       -- username (alphanumeric unique ID e.g. anish42)
  display_name text,                       -- real display name (e.g. "Anish Kumar") — shown in UI
  role         text not null check (role in ('student', 'teacher')),
  device_id    text unique,                -- browser fingerprint stored in localStorage
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast lookup by device_id
create index if not exists app_users_device_id_idx on app_users(device_id);

-- Add display_name to existing tables (run if table already exists)
alter table app_users add column if not exists display_name text;

-- RLS: allow public insert, select, update (no auth needed)
alter table app_users enable row level security;
create policy "allow_public_insert" on app_users for insert with check (true);
create policy "allow_public_select" on app_users for select using (true);
create policy "allow_public_update" on app_users for update using (true);
