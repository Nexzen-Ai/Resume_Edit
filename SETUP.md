# Resume Tailor — Setup Guide

## 1. Supabase Setup

1. Create project at supabase.com
2. Run `backend/supabase_schema.sql` in SQL editor
3. Go to Storage → New bucket → `resumes` (private)
4. Go to Storage → New bucket → `edited-resumes` (private)
5. Copy: Project URL, anon key, service role key

## 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env values
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# Opens at http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |
| GET | /auth/me | Get current user |
| POST | /resume/upload | Upload resume (PDF/DOCX) |
| GET | /resume/ | List user's resumes |
| DELETE | /resume/{id} | Delete resume |
| POST | /edit/ | Tailor resume with JD |
| GET | /edit/{id}/download | Download tailored DOCX |
| GET | /edit/history | Edit history |
