"""Application configuration, loaded from environment variables.

No secrets are hardcoded; everything can be overridden via a .env file
(see .env.example). Sensible defaults are provided for local development.
"""
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- Database ---------------------------------------------------------
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./airbnb.db")

    # --- Auth / JWT -------------------------------------------------------
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_DAYS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "7"))

    # --- Pricing (source of truth lives in utils/pricing.py) --------------
    TAX_RATE: float = float(os.getenv("TAX_RATE", "0.06"))

    # --- CORS -------------------------------------------------------------
    # Comma-separated list of allowed frontend origins.
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if o.strip()
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
