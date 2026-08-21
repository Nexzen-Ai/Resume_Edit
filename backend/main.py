import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from config import settings
from ratelimit import limiter
from routers import auth, resume, edit, admin, credits, assessment, verification, interview, ats

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="NexCV Engine API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(edit.router)
app.include_router(admin.router)
app.include_router(credits.router)
app.include_router(assessment.router)
app.include_router(verification.router)
app.include_router(interview.router)
app.include_router(ats.router)


@app.get("/health")
def health():
    return {"status": "ok"}
