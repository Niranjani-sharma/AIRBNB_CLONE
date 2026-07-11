"""Review DTOs."""
from __future__ import annotations

import datetime as dt

from pydantic import Field

from .common import CamelModel


class ReviewCreate(CamelModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(CamelModel):
    id: int
    listing_id: int
    author_name: str
    author_avatar: str | None = None
    rating: int
    comment: str
    created_at: dt.datetime
