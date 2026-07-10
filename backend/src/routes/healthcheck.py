"""Healthcheck route."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers import healthcheck as controller

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return controller.health()
