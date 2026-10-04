"""
Email utilities for Cofluence.

send_email(to, subject, html_body)
  Sends an email asynchronously via Flask-Executor so it never blocks a request.
  On failure logs a warning and returns silently — the request always succeeds.

make_token(payload, salt, expires_sec=900)
  Signs a dict with itsdangerous using SECRET_KEY + salt.
  Returns a URL-safe string token.

verify_token(token, salt, max_age=900)
  Verifies the token. Returns the payload dict or None if expired/tampered.
"""
import logging
from flask import current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> None:
    """
    Dispatch an email asynchronously so it never blocks a request.
    If sending fails for any reason it logs a warning and returns silently.
    Uses Flask-Mail configured in config.py.
    """
    from flask_mail import Message
    from app import mail, executor

    def _send(app, to, subject, html_body):
        with app.app_context():
            try:
                msg = Message(
                    subject=subject,
                    recipients=[to],
                    html=html_body,
                    sender=current_app.config.get(
                        "MAIL_DEFAULT_SENDER", "noreply@cofluence.dev"
                    ),
                )
                mail.send(msg)
            except Exception as exc:
                logger.warning("Failed to send email to %s: %s", to, exc)

    try:
        app = current_app._get_current_object()
        executor.submit(_send, app, to, subject, html_body)
    except Exception as exc:
        logger.warning("Could not queue email to %s: %s", to, exc)


def make_token(payload: dict, salt: str, expires_sec: int = 900) -> str:
    """
    Sign `payload` with SECRET_KEY + `salt` using itsdangerous.
    Returns a URL-safe token string.
    Default expiry: 15 minutes.
    """
    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return s.dumps(payload, salt=salt)


def verify_token(token: str, salt: str, max_age: int = 900) -> dict | None:
    """
    Verify `token` signed with `salt`.
    Returns the payload dict on success, or None if expired or tampered.
    """
    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        payload = s.loads(token, salt=salt, max_age=max_age)
        return payload
    except (BadSignature, SignatureExpired):
        return None
