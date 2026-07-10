"""Auth controller: signup, login, logout, switch-role.

Auth is intentionally lightweight (the assignment permits simplified auth) but
real: passwords are bcrypt-hashed and sessions are stateless JWTs. A guest/host
role travels inside the token and the user record.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import User
from ..schemas import AuthOut, LoginIn, MessageOut, SignupIn, UserOut
from ..utils.api_error import ApiError
from ..utils.api_response import ApiResponse
from ..utils.constants import GUEST, HOST
from ..utils.security import create_access_token, hash_password, verify_password


def _auth_payload(user: User) -> AuthOut:
    token = create_access_token(user_id=user.id, email=user.email, role=user.role)
    return AuthOut(token=token, user=UserOut.model_validate(user))


def signup(db: Session, body: SignupIn) -> ApiResponse[AuthOut]:
    exists = db.execute(
        select(User).where(User.email == body.email.lower())
    ).scalar_one_or_none()
    if exists:
        raise ApiError(400, "An account with that email already exists")
    user = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ApiResponse(status_code=201, data=_auth_payload(user), message="Account created")


def login(db: Session, body: LoginIn) -> ApiResponse[AuthOut]:
    user = db.execute(
        select(User).where(User.email == body.email.lower())
    ).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise ApiError(400, "Invalid email or password")
    return ApiResponse(status_code=200, data=_auth_payload(user), message="Logged in")


def logout() -> ApiResponse[MessageOut]:
    # Stateless JWT: the client discards the token. Endpoint exists for symmetry.
    return ApiResponse(status_code=200, data=MessageOut(message="Logged out"), message="Logged out")


def switch_role(db: Session, current: User) -> ApiResponse[AuthOut]:
    current.role = HOST if current.role == GUEST else GUEST
    db.commit()
    db.refresh(current)
    return ApiResponse(
        status_code=200, data=_auth_payload(current), message=f"Now in {current.role} mode"
    )
