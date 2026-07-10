"""Listing routes: search + detail + host CRUD, availability, quote, reviews,
and the owner's bookings-on-a-listing view."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ..controllers import listing as controller
from ..db import get_db
from ..middlewares.auth import get_current_user, require_host
from ..models import User
from ..schemas import (
    BookingOut,
    ListingCard,
    ListingCreate,
    ListingDetail,
    ListingPage,
    ListingUpdate,
    QuoteIn,
    QuoteOut,
    ReviewCreate,
    ReviewOut,
)
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/listings", tags=["listings"])


# --- Search / list --------------------------------------------------------
@router.get("", response_model=ApiResponse[ListingPage])
def search_listings(
    db: Session = Depends(get_db),
    location: str | None = None,
    guests: int | None = None,
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    property_type: str | None = None,
    amenities: list[str] | None = Query(default=None),
    check_in: dt.date | None = None,
    check_out: dt.date | None = None,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=48),
):
    return controller.search(
        db,
        location=location,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        amenities=amenities,
        check_in=check_in,
        check_out=check_out,
        sort=sort,
        page=page,
        limit=limit,
    )


@router.get("/mine", response_model=ApiResponse[list[ListingCard]])
def my_listings(host: User = Depends(require_host), db: Session = Depends(get_db)):
    return controller.mine(db, host)


@router.get("/{listing_id}", response_model=ApiResponse[ListingDetail])
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    return controller.get(db, listing_id)


# --- Host CRUD ------------------------------------------------------------
@router.post("", response_model=ApiResponse[ListingDetail], status_code=status.HTTP_201_CREATED)
def create_listing(
    body: ListingCreate, host: User = Depends(require_host), db: Session = Depends(get_db)
):
    return controller.create(db, host, body)


@router.patch("/{listing_id}", response_model=ApiResponse[ListingDetail])
def update_listing(
    listing_id: int,
    body: ListingUpdate,
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    return controller.update(db, host, listing_id, body)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int, host: User = Depends(require_host), db: Session = Depends(get_db)
):
    controller.delete(db, host, listing_id)


# --- Availability & quote -------------------------------------------------
@router.get("/{listing_id}/availability")
def availability(listing_id: int, db: Session = Depends(get_db)):
    return controller.availability(db, listing_id)


@router.post("/{listing_id}/quote", response_model=ApiResponse[QuoteOut])
def quote_listing(listing_id: int, body: QuoteIn, db: Session = Depends(get_db)):
    return controller.quote(db, listing_id, body)


# --- Reviews --------------------------------------------------------------
@router.get("/{listing_id}/reviews", response_model=ApiResponse[list[ReviewOut]])
def list_reviews(listing_id: int, db: Session = Depends(get_db)):
    return controller.list_reviews(db, listing_id)


@router.post(
    "/{listing_id}/reviews",
    response_model=ApiResponse[ReviewOut],
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    listing_id: int,
    body: ReviewCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return controller.create_review(db, current, listing_id, body)


# --- Host: bookings on a listing -----------------------------------------
@router.get("/{listing_id}/bookings", response_model=ApiResponse[list[BookingOut]])
def listing_bookings(
    listing_id: int, host: User = Depends(require_host), db: Session = Depends(get_db)
):
    return controller.listing_bookings(db, host, listing_id)
