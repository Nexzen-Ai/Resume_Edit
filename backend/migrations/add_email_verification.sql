-- Migration: email verification.
-- Adds a verified flag + token. Existing users are grandfathered as verified
-- so they aren't locked out; new signups start unverified.
-- Run once in the Supabase SQL editor on existing projects.

alter table users add column if not exists email_verified boolean not null default false;
alter table users add column if not exists verification_token text;

-- Grandfather existing accounts (created before this migration).
update users set email_verified = true where email_verified = false;
