"""SQLAlchemy engine / session / declarative base for SQLite.

Mirrors the Node `src/db/` layer: a single place that owns the database
connection and hands out request-scoped sessions.
"""
from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from ..utils.config import settings

# check_same_thread=False is required for SQLite under FastAPI's threadpool;
# each request still gets its own Session via the get_db dependency.
connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a request-scoped session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
