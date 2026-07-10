"""Helpers to convert ORM objects into API schemas (keeps controllers thin)."""
from __future__ import annotations

from ..models import Booking, Listing, Review
from ..schemas import (
    BookingOut,
    HostBrief,
    ListingCard,
    ListingDetail,
    PhotoOut,
    ReviewOut,
)


def _cover(listing: Listing) -> str | None:
    if not listing.photos:
        return None
    cover = next((p for p in listing.photos if p.is_cover), listing.photos[0])
    return cover.url


def listing_card(listing: Listing) -> ListingCard:
    return ListingCard(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        country=listing.country,
        property_type=listing.property_type,
        price_per_night=listing.price_per_night,
        rating_avg=listing.rating_avg,
        rating_count=listing.rating_count,
        cover_photo=_cover(listing),
        max_guests=listing.max_guests,
        latitude=listing.latitude,
        longitude=listing.longitude,
    )


def listing_detail(listing: Listing) -> ListingDetail:
    return ListingDetail(
        **listing_card(listing).model_dump(),
        description=listing.description,
        cleaning_fee=listing.cleaning_fee,
        service_fee_pct=listing.service_fee_pct,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        amenities=[a.name for a in listing.amenities],
        photos=[
            PhotoOut(id=p.id, url=p.url, sort_order=p.sort_order, is_cover=p.is_cover)
            for p in listing.photos
        ],
        host=HostBrief(
            id=listing.host.id,
            name=listing.host.name,
            avatar_url=listing.host.avatar_url,
            is_superhost=listing.host.is_superhost,
        ),
    )


def booking_out(booking: Booking, *, include_listing: bool = False) -> BookingOut:
    return BookingOut(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests_count=booking.guests_count,
        nightly_rate=booking.nightly_rate,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        taxes=booking.taxes,
        total_price=booking.total_price,
        status=booking.status,
        listing=listing_card(booking.listing) if include_listing else None,
    )


def review_out(review: Review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        listing_id=review.listing_id,
        author_name=review.author.name if review.author else "Guest",
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
