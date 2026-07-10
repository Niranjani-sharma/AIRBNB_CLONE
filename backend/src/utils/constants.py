"""Shared enum-like constants (mirrors the Node `utils/constants.js`)."""
from __future__ import annotations

# Roles / active context
GUEST = "guest"
HOST = "host"
ROLES = (GUEST, HOST)

# Booking lifecycle
BOOKING_CONFIRMED = "confirmed"
BOOKING_COMPLETED = "completed"  # derived at read time (past check-out)
BOOKING_CANCELLED = "cancelled"

# Listing sort options accepted by GET /api/listings
SORT_NEWEST = "newest"
SORT_PRICE_ASC = "price_asc"
SORT_PRICE_DESC = "price_desc"
SORT_RATING = "rating"
