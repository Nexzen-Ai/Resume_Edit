-- Migration: enable Row-Level Security as defense-in-depth.
-- The backend uses the service-role key (bypasses RLS), so behavior is unchanged.
-- Effect: the anon/public role is denied all access to these tables.
-- Run once in the Supabase SQL editor on existing projects.

alter table users enable row level security;
alter table resumes enable row level security;
alter table edit_jobs enable row level security;
alter table llm_cache enable row level security;
