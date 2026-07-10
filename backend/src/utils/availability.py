"""Availability logic derived from existing bookings.

Overlap rule for a requested range [in, out) (check_out exclusive):
    a booking conflicts if  existing.check_in < out  AND  existing.check_out > in
Cancelled bookings are ignored.
"""
from __future__ import annotations

import datetime as dt

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from ..models import Booking
from .constants import BOOKING_CANCELLED


def overlapping_bookings(
    db: Session,
    *,
    listing_id: int,
    check_in: dt.date,
    check_out: dt.date,
    exclude_booking_id: int | None = None,
):
    stmt = select(Booking).where(
        and_(
            Booking.listing_id == listing_id,
            Booking.status != BOOKING_CANCELLED,
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(Booking.id != exclude_booking_id)
    return db.execute(stmt).scalars().all()


def is_range_available(
    db: Session,
    *,
    listing_id: int,
    check_in: dt.date,
    check_out: dt.date,
    exclude_booking_id: int | None = None,
) -> bool:
    return not overlapping_bookings(
        db,
        listing_id=listing_id,
        check_in=check_in,
        check_out=check_out,
        exclude_booking_id=exclude_booking_id,
    )


def booked_ranges(db: Session, *, listing_id: int) -> list[dict]:
    """Return active (non-cancelled) booked ranges for the availability calendar."""
    rows = (
        db.execute(
            select(Booking)
            .where(Booking.listing_id == listing_id, Booking.status != BOOKING_CANCELLED)
            .order_by(Booking.check_in)
        )
        .scalars()
        .all()
    )
    return [
        {"checkIn": b.check_in.isoformat(), "checkOut": b.check_out.isoformat()}
        for b in rows
    ]
