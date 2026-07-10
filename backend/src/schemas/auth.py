"""Auth / user DTOs."""
from __future__ import annotations

from pydantic import EmailStr, Field

from .common import CamelModel


class SignupIn(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: str = Field(default="guest", pattern="^(guest|host)$")


class LoginIn(CamelModel):
    email: EmailStr
    password: str


class UserOut(CamelModel):
    id: int
    name: str
    email: EmailStr
    avatar_url: str | None = None
    role: str
    is_superhost: bool


class AuthOut(CamelModel):
    token: str
    user: UserOut
