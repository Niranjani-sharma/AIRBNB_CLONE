"""Booking model: a reservation with an immutable cents price snapshot."""
from __future__ import annotations

import datetime as dt

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False
    )
    guest_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    check_in: Mapped[dt.date] = mapped_column(Date, nullable=False)
    check_out: Mapped[dt.date] = mapped_column(Date, nullable=False)  # exclusive
    guests_count: Mapped[int] = mapped_column(Integer, default=1)

    # Cents snapshot at booking time (immutable receipt).
    nightly_rate: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee: Mapped[int] = mapped_column(Integer, default=0)
    service_fee: Mapped[int] = mapped_column(Integer, default=0)
    taxes: Mapped[int] = mapped_column(Integer, default=0)
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)

    status: Mapped[str] = mapped_column(String(20), default="confirmed", index=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    listing: Mapped["Listing"] = relationship(back_populates="bookings")  # noqa: F821
    guest: Mapped["User"] = relationship(back_populates="bookings")  # noqa: F821
