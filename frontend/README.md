# Resume Tailor — Frontend

Next.js frontend for the Resume Tailor app.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
# http://localhost:3000
```

## Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Upload resume, paste JD, download tailored DOCX |

See root [README.md](../README.md) for full project docs.
