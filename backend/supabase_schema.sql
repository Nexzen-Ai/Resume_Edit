-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text not null,
  created_at timestamptz default now()
);

-- Resumes table
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  resume_text text not null,
  uploaded_at timestamptz default now()
);

-- Edit jobs table
create table if not exists edit_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  resume_id uuid references resumes(id) on delete cascade,
  status text not null default 'done',
  storage_path text,
  error text,
  added_skills jsonb default '[]',
  keywords_added jsonb default '[]',
  created_at timestamptz default now()
);

-- RLS: ENABLE with no policies. App talks to Postgres via the service-role key,
-- which bypasses RLS, so this does not affect the app. But it denies the anon/public
-- role all access — so a leaked anon key cannot read these tables. Defense-in-depth.
alter table users enable row level security;
alter table resumes enable row level security;
alter table edit_jobs enable row level security;
-- (intentionally no CREATE POLICY statements: anon = fully denied, service key = full access)

-- Storage buckets (run in Supabase dashboard > Storage > New bucket)
-- Bucket name: resumes        (private)
-- Bucket name: edited-resumes (private)
