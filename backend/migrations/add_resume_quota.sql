-- Migration: resume quota + upgrade requests.
-- resume_limit: how many resumes a user may upload (admin-assigned, default 1).
-- upgrade_requests: in-app enquiries users send to ask for a higher limit.
-- Run once in the Supabase SQL editor.

alter table users add column if not exists resume_limit integer not null default 1;

create table if not exists upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  email text not null,
  full_name text not null,
  message text,
  status text not null default 'pending',  -- 'pending' | 'handled'
  created_at timestamptz default now()
);

alter table upgrade_requests enable row level security;
