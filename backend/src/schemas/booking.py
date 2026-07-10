"""Quote / booking DTOs."""
from __future__ import annotations

import datetime as dt

from pydantic import Field

from .common import CamelModel
from .listing import ListingCard


class QuoteIn(CamelModel):
    check_in: dt.date
    check_out: dt.date
    guests: int = Field(default=1, ge=1)


class QuoteOut(CamelModel):
    nights: int
    nightly_rate: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    taxes: int
    total: int


class BookingCreate(CamelModel):
    listing_id: int
    check_in: dt.date
    check_out: dt.date
    guests_count: int = Field(default=1, ge=1)


class BookingOut(CamelModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: dt.date
    check_out: dt.date
    guests_count: int
    nightly_rate: int
    cleaning_fee: int
    service_fee: int
    taxes: int
    total_price: int
    status: str
    listing: ListingCard | None = None
