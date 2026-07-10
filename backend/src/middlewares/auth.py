"""Auth middleware: FastAPI dependencies that resolve and guard the user.

- get_current_user : requires a valid Bearer JWT, returns the User.
- get_optional_user: like above but returns None on public routes.
- require_host     : requires the active role to be `host`.

Mirrors the Node `middlewares/auth.middleware.js` guard.
"""
from __future__ import annotations

import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..utils.api_error import ApiError
from ..utils.constants import HOST
from ..utils.security import decode_access_token


def _extract_bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = _extract_bearer(authorization)
    if not token:
        raise ApiError(401, "Not authenticated")
    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError:
        raise ApiError(401, "Invalid or expired token")
    user = db.get(User, int(payload.get("sub", 0)))
    if user is None:
        raise ApiError(401, "User no longer exists")
    return user


def get_optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None instead of raising (public routes)."""
    token = _extract_bearer(authorization)
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        return db.get(User, int(payload.get("sub", 0)))
    except (jwt.PyJWTError, ValueError):
        return None


def require_host(current: User = Depends(get_current_user)) -> User:
    if current.role != HOST:
        raise ApiError(403, "Switch to host mode to perform this action")
    return current
