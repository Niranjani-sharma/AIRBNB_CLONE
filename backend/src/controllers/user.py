"""User controller."""
from __future__ import annotations

from ..models import User
from ..schemas import UserOut
from ..utils.api_response import ApiResponse


def me(current: User) -> ApiResponse[UserOut]:
    return ApiResponse(
        status_code=200, data=UserOut.model_validate(current), message="Current user"
    )
