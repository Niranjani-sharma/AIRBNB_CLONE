"""Auth routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..controllers import auth as controller
from ..db import get_db
from ..middlewares.auth import get_current_user
from ..models import User
from ..schemas import AuthOut, LoginIn, MessageOut, SignupIn
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=ApiResponse[AuthOut], status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    return controller.signup(db, body)


@router.post("/login", response_model=ApiResponse[AuthOut])
def login(body: LoginIn, db: Session = Depends(get_db)):
    return controller.login(db, body)


@router.post("/logout", response_model=ApiResponse[MessageOut])
def logout():
    return controller.logout()


@router.post("/switch-role", response_model=ApiResponse[AuthOut])
def switch_role(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.switch_role(db, current)
