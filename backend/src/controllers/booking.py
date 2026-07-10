"""Booking controller.

Booking creation re-checks availability *inside the same transaction* as the
insert. SQLite serializes writes, so committing the check + insert together
prevents a double-booking race; a conflict returns 409 with no partial write.
"""
from __future__ import annotations

import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import Booking, Listing, User
from ..schemas import BookingCreate, BookingOut
from ..utils.api_error import ApiError
from ..utils.api_response import ApiResponse
from ..utils.availability import is_range_available
from ..utils.constants import BOOKING_CONFIRMED
from ..utils.pricing import quote as compute_quote
from ..utils.serializers import booking_out


def create(db: Session, current: User, body: BookingCreate) -> ApiResponse[BookingOut]:
    listing = db.execute(
        select(Listing).where(Listing.id == body.listing_id, Listing.is_active.is_(True))
    ).scalar_one_or_none()
    if listing is None:
        raise ApiError(404, "Listing not found")

    if body.check_out <= body.check_in:
        raise ApiError(422, "check_out must be after check_in")
    if body.check_in < dt.date.today():
        raise ApiError(422, "check_in cannot be in the past")
    if body.guests_count > listing.max_guests:
        raise ApiError(422, "Too many guests for this listing")

    # Re-check availability, then write, in one transaction.
    if not is_range_available(
        db, listing_id=listing.id, check_in=body.check_in, check_out=body.check_out
    ):
        raise ApiError(409, "Those dates are no longer available")

    breakdown = compute_quote(
        nightly_rate=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee_pct=listing.service_fee_pct,
        check_in=body.check_in,
        check_out=body.check_out,
    )

    booking = Booking(
        listing_id=listing.id,
        guest_id=current.id,
        check_in=body.check_in,
        check_out=body.check_out,
        guests_count=body.guests_count,
        nightly_rate=breakdown.nightly_rate,
        cleaning_fee=breakdown.cleaning_fee,
        service_fee=breakdown.service_fee,
        taxes=breakdown.taxes,
        total_price=breakdown.total,
        status=BOOKING_CONFIRMED,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    booking.listing = listing
    return ApiResponse(
        status_code=201,
        data=booking_out(booking, include_listing=True),
        message="Booking confirmed",
    )


def my_trips(db: Session, current: User) -> ApiResponse[list[BookingOut]]:
    rows = (
        db.execute(
            select(Booking)
            .where(Booking.guest_id == current.id)
            .options(selectinload(Booking.listing).selectinload(Listing.photos))
            .order_by(Booking.check_in.desc())
        )
        .scalars()
        .all()
    )
    today = dt.date.today()
    out: list[BookingOut] = []
    for b in rows:
        # Derive completed status for display without mutating stored data.
        dto = booking_out(b, include_listing=True)
        if dto.status == BOOKING_CONFIRMED and b.check_out <= today:
            dto.status = "completed"
        out.append(dto)
    return ApiResponse(status_code=200, data=out, message="My trips")


def cancel(db: Session, current: User, booking_id: int) -> ApiResponse[BookingOut]:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise ApiError(404, "Booking not found")
    if booking.guest_id != current.id:
        raise ApiError(403, "This is not your booking")
    if booking.check_in < dt.date.today():
        raise ApiError(422, "Cannot cancel a past booking")
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return ApiResponse(status_code=200, data=booking_out(booking), message="Booking cancelled")
