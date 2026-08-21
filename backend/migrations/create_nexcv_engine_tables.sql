-- 1. Extend Users table for credits & edu verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_balance INTEGER NOT NULL DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_edu_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- 2. Fact Graphs Table
CREATE TABLE IF NOT EXISTS fact_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  atomic_facts JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Assessments Table (Adaptive Diagnostic Tests)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  target_jd TEXT NOT NULL,
  missing_competencies JSONB NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assessment Submissions & Grading
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_answers JSONB NOT NULL,
  score_percent NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  detailed_breakdown JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cryptographic Verifications Table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES assessment_submissions(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  score_percent NUMERIC(5,2) NOT NULL,
  signature_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Interview Prep (Low-YOE Defense Questions)
CREATE TABLE IF NOT EXISTS interview_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  gap_topics JSONB NOT NULL,
  star_questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Credits Ledger Table
CREATE TABLE IF NOT EXISTS credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'signup_bonus', 'edu_bonus', 'referral_earned', 'scan_used', 'test_used', 'interview_used', 'purchase'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Referrals Tracking Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  granted_credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fact_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
