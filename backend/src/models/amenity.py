"""Amenity catalog + the listings<->amenities association table."""
from __future__ import annotations

from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base

# --- Association table: listings <-> amenities (many-to-many) -------------
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)

    listings: Mapped[list["Listing"]] = relationship(  # noqa: F821
        secondary=listing_amenities, back_populates="amenities"
    )
