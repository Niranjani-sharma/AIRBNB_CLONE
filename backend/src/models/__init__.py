"""ORM models package.

Importing this package registers every table on the shared ``Base`` metadata,
so ``Base.metadata.create_all`` and string-based relationships resolve. One
file per table mirrors the Node ``src/models/`` layout.

Design notes:
- Money is stored as INTEGER cents everywhere to avoid float errors.
- Amenities use a proper many-to-many join table (SQL-idiomatic).
- Photos are a child table (one listing -> many photos).
- Availability is derived from bookings (no separate blocked-dates table in MVP).
- Soft-delete on listings via is_active to preserve booking history.
"""
from __future__ import annotations

from .amenity import Amenity, listing_amenities
from .booking import Booking
from .listing import Listing
from .photo import ListingPhoto
from .review import Review
from .user import User
from .wishlist import Wishlist

__all__ = [
    "Amenity",
    "listing_amenities",
    "Booking",
    "Listing",
    "ListingPhoto",
    "Review",
    "User",
    "Wishlist",
]
