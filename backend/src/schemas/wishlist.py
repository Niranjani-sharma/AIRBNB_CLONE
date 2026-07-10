"""Wishlist DTOs."""
from __future__ import annotations

from .common import CamelModel
from .listing import ListingCard


class WishlistAdd(CamelModel):
    listing_id: int


class WishlistItemOut(CamelModel):
    id: int
    listing: ListingCard
