"""User model: guests and hosts share one table; `role` is the active context."""
from __future__ import annotations

import datetime as dt

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Active context; a user can toggle between the two.
    role: Mapped[str] = mapped_column(String(10), default="guest", nullable=False)
    is_superhost: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    listings: Mapped[list["Listing"]] = relationship(back_populates="host")  # noqa: F821
    bookings: Mapped[list["Booking"]] = relationship(back_populates="guest")  # noqa: F821
