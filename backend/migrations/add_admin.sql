-- Migration: admin + access control.
-- role: 'user' | 'admin'. is_active: admin can disable. access_expires_at:
-- term end (null = unlimited). Run once in the Supabase SQL editor.

alter table users add column if not exists role text not null default 'user';
alter table users add column if not exists is_active boolean not null default true;
alter table users add column if not exists access_expires_at timestamptz;
