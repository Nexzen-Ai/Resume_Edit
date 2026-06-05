import logging
import smtplib
from email.message import EmailMessage
from config import settings

logger = logging.getLogger(__name__)


def _verification_link(token: str) -> str:
    return f"{settings.backend_url.rstrip('/')}/auth/verify?token={token}"


def send_verification_email(to_email: str, full_name: str, token: str) -> None:
    """Email a verification link. If SMTP isn't configured, log the link (dev mode)."""
    link = _verification_link(token)

    if not settings.smtp_configured:
        logger.warning("SMTP not configured — verification link for %s: %s", to_email, link)
        return

    msg = EmailMessage()
    msg["Subject"] = "Verify your Resume Tailor account"
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to_email
    msg.set_content(
        f"Hi {full_name},\n\n"
        f"Confirm your email to activate your Resume Tailor account:\n{link}\n\n"
        f"If you didn't sign up, ignore this email."
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send verification email to %s", to_email)
        raise
