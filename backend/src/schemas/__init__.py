"""Pydantic v2 DTOs, split per resource (mirrors the modular models package)."""
from __future__ import annotations

from .auth import AuthOut, LoginIn, SignupIn, UserOut
from .booking import BookingCreate, BookingOut, QuoteIn, QuoteOut
from .common import CamelModel, MessageOut
from .listing import (
    HostBrief,
    ListingBase,
    ListingCard,
    ListingCreate,
    ListingDetail,
    ListingPage,
    ListingUpdate,
    PhotoIn,
    PhotoOut,
)
from .review import ReviewCreate, ReviewOut
from .wishlist import WishlistAdd, WishlistItemOut

__all__ = [
    "AuthOut", "LoginIn", "SignupIn", "UserOut",
    "BookingCreate", "BookingOut", "QuoteIn", "QuoteOut",
    "CamelModel", "MessageOut",
    "HostBrief", "ListingBase", "ListingCard", "ListingCreate", "ListingDetail",
    "ListingPage", "ListingUpdate", "PhotoIn", "PhotoOut",
    "ReviewCreate", "ReviewOut",
    "WishlistAdd", "WishlistItemOut",
]
