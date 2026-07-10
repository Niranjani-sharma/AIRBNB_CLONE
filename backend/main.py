"""Server entrypoint.

Run locally with:  uvicorn main:app --reload --port 8000
(or simply:        python main.py)
"""
from __future__ import annotations

from src.app import app  # noqa: F401  (re-exported for `uvicorn main:app`)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.app:app", host="0.0.0.0", port=8000, reload=True)
