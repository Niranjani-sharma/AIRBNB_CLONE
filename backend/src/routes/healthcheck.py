"""Healthcheck route."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers import healthcheck as controller

router = APIRouter(tags=["health"])


# Accept GET and HEAD so uptime monitors work regardless of their default method
# (e.g. UptimeRobot sends HEAD; a GET-only route would 405).
@router.api_route("/health", methods=["GET", "HEAD"])
def health():
    return controller.health()
