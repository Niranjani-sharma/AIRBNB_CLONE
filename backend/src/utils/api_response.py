"""Standardized success envelope (mirrors the Node `utils/api-response.js`).

Every successful response is wrapped as:

    { "statusCode": 200, "data": <payload>, "message": "...", "success": true }

`ApiResponse` is a generic Pydantic model, so routes can declare
`response_model=ApiResponse[BookingOut]` and keep full typing + OpenAPI docs
while the payload lives under `data`. Fields serialize to camelCase to match
the rest of the API contract.
"""
from __future__ import annotations

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    status_code: int = 200
    data: Optional[T] = None
    message: str = "Success"
    success: bool = True
