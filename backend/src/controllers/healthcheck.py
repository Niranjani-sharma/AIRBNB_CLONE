"""Healthcheck controller (liveness probe)."""
from __future__ import annotations

from ..utils.api_response import ApiResponse


def health() -> ApiResponse:
    return ApiResponse(status_code=200, data={"status": "ok"}, message="OK")
