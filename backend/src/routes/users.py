"""User routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from ..controllers import user as controller
from ..middlewares.auth import get_current_user
from ..models import User
from ..schemas import UserOut
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ApiResponse[UserOut])
def me(current: User = Depends(get_current_user)):
    return controller.me(current)
