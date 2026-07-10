"""Wishlist controller."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Listing, User, Wishlist
from ..schemas import MessageOut, WishlistAdd, WishlistItemOut
from ..utils.api_error import ApiError
from ..utils.api_response import ApiResponse
from ..utils.serializers import listing_card


def get_wishlist(db: Session, current: User) -> ApiResponse[list[WishlistItemOut]]:
    items = (
        db.execute(
            select(Wishlist)
            .where(Wishlist.user_id == current.id)
            .order_by(Wishlist.created_at.desc())
        )
        .scalars()
        .all()
    )
    out: list[WishlistItemOut] = []
    for w in items:
        listing = db.get(Listing, w.listing_id)
        if listing and listing.is_active:
            out.append(WishlistItemOut(id=w.id, listing=listing_card(listing)))
    return ApiResponse(status_code=200, data=out, message="Wishlist")


def add_wishlist(db: Session, current: User, body: WishlistAdd) -> ApiResponse[MessageOut]:
    listing = db.get(Listing, body.listing_id)
    if listing is None or not listing.is_active:
        raise ApiError(404, "Listing not found")
    existing = db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current.id, Wishlist.listing_id == body.listing_id
        )
    ).scalar_one_or_none()
    if existing:
        return ApiResponse(
            status_code=200, data=MessageOut(message="Already in wishlist"), message="Already saved"
        )
    db.add(Wishlist(user_id=current.id, listing_id=body.listing_id))
    db.commit()
    return ApiResponse(
        status_code=201, data=MessageOut(message="Added to wishlist"), message="Added to wishlist"
    )


def remove_wishlist(db: Session, current: User, listing_id: int) -> None:
    existing = db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current.id, Wishlist.listing_id == listing_id
        )
    ).scalar_one_or_none()
    if existing:
        db.delete(existing)
        db.commit()
