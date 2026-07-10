"""Standardized API error (mirrors the Node `utils/api-error.js`).

ApiError subclasses FastAPI's HTTPException so it flows through the normal
exception machinery, while carrying an optional structured `errors` list that
the global handler serializes into the `{ success:false, message, errors }`
envelope.
"""
from __future__ import annotations

from fastapi import HTTPException


class ApiError(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str = "Something went wrong",
        errors: list | None = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=message)
        self.errors = errors or []
