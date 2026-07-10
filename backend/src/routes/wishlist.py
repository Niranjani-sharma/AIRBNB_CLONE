"""Wishlist routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..controllers import wishlist as controller
from ..db import get_db
from ..middlewares.auth import get_current_user
from ..models import User
from ..schemas import MessageOut, WishlistAdd, WishlistItemOut
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=ApiResponse[list[WishlistItemOut]])
def get_wishlist(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.get_wishlist(db, current)


@router.post("", response_model=ApiResponse[MessageOut], status_code=status.HTTP_201_CREATED)
def add_wishlist(
    body: WishlistAdd, current: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return controller.add_wishlist(db, current, body)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(
    listing_id: int, current: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    controller.remove_wishlist(db, current, listing_id)
