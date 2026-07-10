"""FastAPI application factory (mirrors the Node ``src/app.js``).

Wires CORS, the standardized error envelope, and every resource router under
the ``/api`` prefix. Tables are created on import for the SQLite MVP (Alembic
would own migrations in a larger project).
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import models  # noqa: F401  (registers ORM tables on Base.metadata)
from .db import Base, engine
from .routes import auth, bookings, healthcheck, listings, users, wishlist
from .utils.config import settings

# Create tables on startup (SQLite). For a bigger project you'd use Alembic.
Base.metadata.create_all(bind=engine)


def _error_body(status_code: int, message: str, errors: list | None = None) -> dict:
    return {
        "statusCode": status_code,
        "message": message,
        "success": False,
        "errors": errors or [],
    }


def create_app() -> FastAPI:
    app = FastAPI(title="Airbnb Clone API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Standardized error envelope (matches ApiResponse's shape) --------
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.status_code, str(exc.detail), getattr(exc, "errors", [])),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content=_error_body(422, "Validation failed", jsonable_encoder(exc.errors())),
        )

    # --- Routers ----------------------------------------------------------
    api_prefix = "/api"
    app.include_router(healthcheck.router, prefix=api_prefix)
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(users.router, prefix=api_prefix)
    app.include_router(listings.router, prefix=api_prefix)
    app.include_router(bookings.router, prefix=api_prefix)
    app.include_router(wishlist.router, prefix=api_prefix)

    @app.get("/")
    def root():
        return {"name": "Airbnb Clone API", "docs": "/docs", "health": "/api/health"}

    return app


app = create_app()
