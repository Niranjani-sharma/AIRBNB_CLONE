"""Security helpers: password hashing (bcrypt) and JWT encode/decode.

We use the `bcrypt` package directly (rather than passlib) to avoid
version-coupling issues, and PyJWT for tokens.
"""
from __future__ import annotations

import datetime as dt

import bcrypt
import jwt

from .config import settings


# --- Passwords ------------------------------------------------------------
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# --- JWT ------------------------------------------------------------------
def create_access_token(*, user_id: int, email: str, role: str) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + dt.timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises jwt.PyJWTError on invalid/expired token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
