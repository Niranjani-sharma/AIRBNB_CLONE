"""Base Pydantic config + tiny shared DTOs.

Responses serialize to camelCase (via an alias generator) so the Next.js /
TypeScript frontend receives idiomatic JS keys, while inputs accept either
snake_case or camelCase (populate_by_name=True).
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MessageOut(CamelModel):
    message: str
