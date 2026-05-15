# Resume Tailor

AI-powered resume tailoring app. Upload your resume, paste a job description, get a tailored DOCX — no reformatting, only targeted additions.

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, Python 3.13 |
| Frontend | Next.js, TypeScript |
| Database + Storage | Supabase (Postgres + S3) |
| AI | LiteLLM (swap any provider via `.env`) |
| Auth | JWT (custom, bcrypt) |

## How It Works

1. User registers and uploads one resume (DOCX only)
2. User pastes a job description (max 1000 chars)
3. Backend sends resume + JD to LLM → returns targeted additions only
4. Additions applied to original DOCX — formatting preserved
5. User downloads tailored resume

## Setup

### 1. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run `backend/supabase_schema.sql` in SQL editor
3. Run `backend/migrations/create_llm_cache.sql` in SQL editor
4. Storage → New bucket → `resumes` (private)
5. Storage → New bucket → `edited-resumes` (private)
6. Copy: Project URL, anon key, service role key

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env values
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# http://localhost:3000
```

## Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# LLM — change model string to swap provider, no code changes needed
LLM_API_KEY=your-api-key
LLM_MODEL=gemini/gemini-2.0-flash-lite

JWT_SECRET=your-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=3600

# Optional overrides
DAILY_EDIT_LIMIT=5
```

#### Supported LLM providers (via LiteLLM)

| Provider | `LLM_MODEL` |
|---|---|
| Google Gemini | `gemini/gemini-2.0-flash-lite` |
| Anthropic | `claude-3-5-haiku-20241022` |
| OpenAI | `gpt-4o-mini` |
| Ollama (local, free) | `ollama/llama3` |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| POST | `/resume/upload` | Upload resume (DOCX, max 5MB, 1 per account) |
| GET | `/resume/` | List resumes |
| DELETE | `/resume/{id}` | Delete resume |
| POST | `/edit/` | Tailor resume with JD |
| GET | `/edit/{id}/download` | Download tailored DOCX |
| GET | `/edit/history` | Edit history |

## Usage Limits

| Limit | Value | Configurable |
|---|---|---|
| Resumes per account | 1 | No (by design) |
| Job description length | 1000 chars | `schemas.py` |
| Edits per day | 5 | `DAILY_EDIT_LIMIT` in `.env` |
| Resume size | 5 MB | `routers/resume.py` |

## Project Structure

```
backend/
  config.py              — settings from .env
  database.py            — Supabase client
  main.py                — FastAPI app, router registration
  models/schemas.py      — Pydantic request/response models
  routers/
    auth.py              — register, login, /me
    resume.py            — upload, list, delete
    edit.py              — tailor, download, history
  services/
    auth_service.py      — JWT, bcrypt, user queries
    llm_service.py       — LiteLLM call, caching, prompt
    resume_parser.py     — DOCX text extraction, stripping
    resume_builder.py    — apply LLM edits to DOCX
  migrations/
    create_llm_cache.sql — LLM result cache table

frontend/
  src/app/
    page.tsx             — landing
    login/page.tsx       — login
    register/page.tsx    — register
    dashboard/page.tsx   — main app
  src/components/
    Navbar.tsx           — navigation
```
