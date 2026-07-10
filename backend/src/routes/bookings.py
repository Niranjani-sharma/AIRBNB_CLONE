"""Booking routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..controllers import booking as controller
from ..db import get_db
from ..middlewares.auth import get_current_user
from ..models import User
from ..schemas import BookingCreate, BookingOut
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=ApiResponse[BookingOut], status_code=status.HTTP_201_CREATED)
def create_booking(
    body: BookingCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return controller.create(db, current, body)


@router.get("/me", response_model=ApiResponse[list[BookingOut]])
def my_trips(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.my_trips(db, current)


@router.patch("/{booking_id}/cancel", response_model=ApiResponse[BookingOut])
def cancel_booking(
    booking_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return controller.cancel(db, current, booking_id)
