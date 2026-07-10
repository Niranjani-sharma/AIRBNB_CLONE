"""Listing / photo / host DTOs."""
from __future__ import annotations

from pydantic import Field

from .common import CamelModel


# --- Photos ---------------------------------------------------------------
class PhotoIn(CamelModel):
    url: str
    sort_order: int = 0
    is_cover: bool = False


class PhotoOut(CamelModel):
    id: int
    url: str
    sort_order: int
    is_cover: bool


# --- Host brief -----------------------------------------------------------
class HostBrief(CamelModel):
    id: int
    name: str
    avatar_url: str | None = None
    is_superhost: bool


# --- Listings -------------------------------------------------------------
class ListingBase(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    property_type: str = "apartment"
    city: str = ""
    country: str = ""
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: int = Field(ge=0)  # cents
    cleaning_fee: int = Field(default=0, ge=0)
    service_fee_pct: float = Field(default=0.14, ge=0, le=1)
    max_guests: int = Field(default=2, ge=1)
    bedrooms: int = Field(default=1, ge=0)
    beds: int = Field(default=1, ge=0)
    bathrooms: float = Field(default=1.0, ge=0)


class ListingCreate(ListingBase):
    amenities: list[str] = []
    photos: list[PhotoIn] = []


class ListingUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    property_type: str | None = None
    city: str | None = None
    country: str | None = None
    price_per_night: int | None = Field(default=None, ge=0)
    cleaning_fee: int | None = Field(default=None, ge=0)
    service_fee_pct: float | None = Field(default=None, ge=0, le=1)
    max_guests: int | None = Field(default=None, ge=1)
    bedrooms: int | None = Field(default=None, ge=0)
    beds: int | None = Field(default=None, ge=0)
    bathrooms: float | None = Field(default=None, ge=0)
    amenities: list[str] | None = None
    photos: list[PhotoIn] | None = None


class ListingCard(CamelModel):
    id: int
    title: str
    city: str
    country: str
    property_type: str
    price_per_night: int
    rating_avg: float | None
    rating_count: int
    cover_photo: str | None
    max_guests: int
    latitude: float | None = None
    longitude: float | None = None


class ListingDetail(ListingCard):
    description: str
    cleaning_fee: int
    service_fee_pct: float
    bedrooms: int
    beds: int
    bathrooms: float
    amenities: list[str]
    photos: list[PhotoOut]
    host: HostBrief


class ListingPage(CamelModel):
    items: list[ListingCard]
    page: int
    limit: int
    total: int
    total_pages: int
