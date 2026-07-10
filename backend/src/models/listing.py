"""Listing model: a property a host offers for booking."""
from __future__ import annotations

import datetime as dt

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base
from .amenity import listing_amenities


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    property_type: Mapped[str] = mapped_column(String(40), index=True, default="apartment")

    # Location (denormalized flat columns keep SQLite queries simple).
    city: Mapped[str] = mapped_column(String(120), index=True, default="")
    country: Mapped[str] = mapped_column(String(120), default="")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Money in integer cents.
    price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee: Mapped[int] = mapped_column(Integer, default=0)
    service_fee_pct: Mapped[float] = mapped_column(Float, default=0.14)

    max_guests: Mapped[int] = mapped_column(Integer, default=2)
    bedrooms: Mapped[int] = mapped_column(Integer, default=1)
    beds: Mapped[int] = mapped_column(Integer, default=1)
    bathrooms: Mapped[float] = mapped_column(Float, default=1.0)

    # Denormalized rating aggregate for cheap card rendering.
    rating_avg: Mapped[float | None] = mapped_column(Float, nullable=True)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    host: Mapped["User"] = relationship(back_populates="listings")  # noqa: F821
    photos: Mapped[list["ListingPhoto"]] = relationship(  # noqa: F821
        back_populates="listing", cascade="all, delete-orphan", order_by="ListingPhoto.sort_order"
    )
    amenities: Mapped[list["Amenity"]] = relationship(  # noqa: F821
        secondary=listing_amenities, back_populates="listings"
    )
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing")  # noqa: F821
