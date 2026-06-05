-- Migration: support async edit jobs.
-- Adds an error column so failed background jobs can surface a reason via /status.
-- Run once in the Supabase SQL editor on existing projects.

alter table edit_jobs add column if not exists error text;

-- Existing rows default to 'done'; new async jobs start as 'queued'.
