"""Listing controller: search + detail + host CRUD, plus availability, quote,
reviews, and the owner's view of bookings on a listing."""
from __future__ import annotations

import datetime as dt

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, selectinload

from ..models import Amenity, Booking, Listing, ListingPhoto, Review, User
from ..schemas import (
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
from ..utils.api_error import ApiError
from ..utils.api_response import ApiResponse
from ..utils.availability import booked_ranges, is_range_available
from ..utils.constants import (
    BOOKING_CANCELLED,
    SORT_PRICE_ASC,
    SORT_PRICE_DESC,
    SORT_RATING,
)
from ..utils.pricing import quote as compute_quote
from ..utils.serializers import booking_out, listing_card, listing_detail, review_out


# --- Internal helpers -----------------------------------------------------
def _get_or_create_amenities(db: Session, names: list[str]) -> list[Amenity]:
    result: list[Amenity] = []
    for raw in names:
        name = raw.strip()
        if not name:
            continue
        amenity = db.execute(select(Amenity).where(Amenity.name == name)).scalar_one_or_none()
        if amenity is None:
            amenity = Amenity(name=name)
            db.add(amenity)
            db.flush()
        result.append(amenity)
    return result


def _load_full(db: Session, listing_id: int) -> Listing:
    listing = db.execute(
        select(Listing)
        .where(Listing.id == listing_id, Listing.is_active.is_(True))
        .options(
            selectinload(Listing.photos),
            selectinload(Listing.amenities),
            selectinload(Listing.host),
        )
    ).scalar_one_or_none()
    if listing is None:
        raise ApiError(404, "Listing not found")
    return listing


# --- Search / list --------------------------------------------------------
def search(
    db: Session,
    *,
    location: str | None,
    guests: int | None,
    min_price: int | None,
    max_price: int | None,
    property_type: str | None,
    amenities: list[str] | None,
    check_in: dt.date | None,
    check_out: dt.date | None,
    sort: str,
    page: int,
    limit: int,
) -> ApiResponse[ListingPage]:
    stmt = select(Listing).where(Listing.is_active.is_(True))

    if location:
        like = f"%{location}%"
        stmt = stmt.where((Listing.city.ilike(like)) | (Listing.country.ilike(like)))
    if guests:
        stmt = stmt.where(Listing.max_guests >= guests)
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if property_type:
        stmt = stmt.where(Listing.property_type == property_type)
    if amenities:
        for name in amenities:
            stmt = stmt.where(Listing.amenities.any(Amenity.name == name))
    # Date-range availability: exclude listings with an overlapping booking.
    if check_in and check_out and check_out > check_in:
        stmt = stmt.where(
            ~Listing.bookings.any(
                and_(
                    Booking.status != BOOKING_CANCELLED,
                    Booking.check_in < check_out,
                    Booking.check_out > check_in,
                )
            )
        )

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()

    if sort == SORT_PRICE_ASC:
        stmt = stmt.order_by(Listing.price_per_night.asc())
    elif sort == SORT_PRICE_DESC:
        stmt = stmt.order_by(Listing.price_per_night.desc())
    elif sort == SORT_RATING:
        stmt = stmt.order_by(Listing.rating_avg.desc().nullslast())
    else:
        stmt = stmt.order_by(Listing.created_at.desc(), Listing.id.desc())

    stmt = stmt.options(selectinload(Listing.photos)).offset((page - 1) * limit).limit(limit)
    rows = db.execute(stmt).scalars().all()

    total_pages = (total + limit - 1) // limit
    payload = ListingPage(
        items=[listing_card(r) for r in rows],
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )
    return ApiResponse(status_code=200, data=payload, message="Listings")


def mine(db: Session, host: User) -> ApiResponse[list[ListingCard]]:
    rows = (
        db.execute(
            select(Listing)
            .where(Listing.host_id == host.id, Listing.is_active.is_(True))
            .options(selectinload(Listing.photos))
            .order_by(Listing.created_at.desc())
        )
        .scalars()
        .all()
    )
    return ApiResponse(
        status_code=200, data=[listing_card(r) for r in rows], message="Your listings"
    )


def get(db: Session, listing_id: int) -> ApiResponse[ListingDetail]:
    return ApiResponse(
        status_code=200, data=listing_detail(_load_full(db, listing_id)), message="Listing detail"
    )


# --- Host CRUD ------------------------------------------------------------
def create(db: Session, host: User, body: ListingCreate) -> ApiResponse[ListingDetail]:
    listing = Listing(
        host_id=host.id,
        **body.model_dump(exclude={"amenities", "photos"}),
    )
    listing.amenities = _get_or_create_amenities(db, body.amenities)
    listing.photos = [
        ListingPhoto(url=p.url, sort_order=p.sort_order, is_cover=(p.is_cover or i == 0))
        for i, p in enumerate(body.photos)
    ]
    db.add(listing)
    db.commit()
    return ApiResponse(
        status_code=201, data=listing_detail(_load_full(db, listing.id)), message="Listing created"
    )


def update(
    db: Session, host: User, listing_id: int, body: ListingUpdate
) -> ApiResponse[ListingDetail]:
    listing = _load_full(db, listing_id)
    if listing.host_id != host.id:
        raise ApiError(403, "You do not own this listing")

    data = body.model_dump(exclude_unset=True, exclude={"amenities", "photos"})
    for field, value in data.items():
        setattr(listing, field, value)

    if body.amenities is not None:
        listing.amenities = _get_or_create_amenities(db, body.amenities)
    if body.photos is not None:
        listing.photos = [
            ListingPhoto(url=p.url, sort_order=p.sort_order, is_cover=(p.is_cover or i == 0))
            for i, p in enumerate(body.photos)
        ]

    db.commit()
    return ApiResponse(
        status_code=200, data=listing_detail(_load_full(db, listing_id)), message="Listing updated"
    )


def delete(db: Session, host: User, listing_id: int) -> None:
    listing = _load_full(db, listing_id)
    if listing.host_id != host.id:
        raise ApiError(403, "You do not own this listing")
    listing.is_active = False  # soft delete preserves booking history
    db.commit()


# --- Availability & quote -------------------------------------------------
def availability(db: Session, listing_id: int) -> ApiResponse:
    _load_full(db, listing_id)
    data = {"listingId": listing_id, "booked": booked_ranges(db, listing_id=listing_id)}
    return ApiResponse(status_code=200, data=data, message="Booked ranges")


def quote(db: Session, listing_id: int, body: QuoteIn) -> ApiResponse[QuoteOut]:
    listing = _load_full(db, listing_id)
    if body.guests > listing.max_guests:
        raise ApiError(422, "Too many guests for this listing")
    try:
        breakdown = compute_quote(
            nightly_rate=listing.price_per_night,
            cleaning_fee=listing.cleaning_fee,
            service_fee_pct=listing.service_fee_pct,
            check_in=body.check_in,
            check_out=body.check_out,
        )
    except ValueError as exc:
        raise ApiError(422, str(exc))
    return ApiResponse(
        status_code=200, data=QuoteOut(**breakdown.as_dict()), message="Price breakdown"
    )


# --- Reviews --------------------------------------------------------------
def list_reviews(db: Session, listing_id: int) -> ApiResponse[list[ReviewOut]]:
    rows = (
        db.execute(
            select(Review)
            .where(Review.listing_id == listing_id)
            .options(selectinload(Review.author))
            .order_by(Review.created_at.desc())
        )
        .scalars()
        .all()
    )
    return ApiResponse(status_code=200, data=[review_out(r) for r in rows], message="Reviews")


def create_review(
    db: Session, current: User, listing_id: int, body: ReviewCreate
) -> ApiResponse[ReviewOut]:
    _load_full(db, listing_id)
    today = dt.date.today()
    completed_stay = db.execute(
        select(Booking).where(
            Booking.listing_id == listing_id,
            Booking.guest_id == current.id,
            Booking.status != BOOKING_CANCELLED,
            Booking.check_out <= today,
        )
    ).scalar_one_or_none()
    if completed_stay is None:
        raise ApiError(403, "You can only review a listing after a completed stay")

    review = Review(
        listing_id=listing_id,
        booking_id=completed_stay.id,
        author_id=current.id,
        rating=body.rating,
        comment=body.comment,
    )
    db.add(review)
    db.flush()

    # Recompute denormalized aggregate.
    avg, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.listing_id == listing_id
        )
    ).one()
    listing = db.get(Listing, listing_id)
    listing.rating_avg = round(float(avg), 2) if avg is not None else None
    listing.rating_count = int(count)

    db.commit()
    db.refresh(review)
    review.author = current
    return ApiResponse(status_code=201, data=review_out(review), message="Review posted")


# --- Host: bookings on a listing -----------------------------------------
def listing_bookings(db: Session, host: User, listing_id: int) -> ApiResponse[list]:
    listing = _load_full(db, listing_id)
    if listing.host_id != host.id:
        raise ApiError(403, "You do not own this listing")
    rows = (
        db.execute(
            select(Booking).where(Booking.listing_id == listing_id).order_by(Booking.check_in)
        )
        .scalars()
        .all()
    )
    return ApiResponse(
        status_code=200, data=[booking_out(b) for b in rows], message="Bookings on listing"
    )
