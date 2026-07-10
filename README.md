# StayFinder — Airbnb Clone

A functional clone of the Airbnb marketplace: browse and search stays, view listing
details, filter by criteria, book date ranges with availability enforcement, and manage
your own listings as a host — in a photo-forward UI that resembles Airbnb.

- **Frontend:** Next.js 14 (App Router, TypeScript) + Tailwind CSS
- **Backend:** Python + FastAPI
- **Database:** SQLite (SQLAlchemy 2.0 ORM), self-designed relational schema

> **Demo:** _add your deployed frontend + backend URLs here_

---

## Repository Layout

```
airbnb/
├── backend/     # FastAPI + SQLite REST API
├── frontend/    # Next.js (TypeScript) web app
├── PRD.md       # Product requirements document
└── README.md    # this file
```

### Backend layout (layered, one file per resource)

```
backend/
├── main.py                 # entrypoint: `uvicorn main:app`
├── seed.py                 # deterministic seed (drops & recreates tables)
├── requirements.txt
└── src/
    ├── app.py              # app factory: CORS, routers, error envelope
    ├── routes/             # thin routers (path + deps -> controller)
    ├── controllers/        # business logic per resource
    ├── middlewares/        # FastAPI dependencies (auth guards)
    ├── models/             # SQLAlchemy ORM tables (one file per table)
    ├── schemas/            # Pydantic DTOs (camelCase I/O)
    ├── db/                 # engine / session / Base
    └── utils/              # ApiError, ApiResponse, constants, config,
                            #   security, pricing, availability, serializers
```

Request flow: **route → controller → (service in `utils` / serializer) → ORM model**.
Auth guards live in `middlewares/`; pricing and availability are the single
server-side source of truth in `utils/`.

---

## Architecture

Two independently deployable services communicating over HTTP/JSON.

```
Browser
  │
  ▼
Next.js (frontend/)
  • Server Components fetch public listing data for first paint
  • Client Components call the API via an axios client that
    attaches the JWT as a Bearer header
  │  HTTP  (NEXT_PUBLIC_API_URL, e.g. http://localhost:8000/api)
  ▼
FastAPI (backend/)  →  SQLAlchemy  →  SQLite (airbnb.db)
  • Thin routers → controllers → services (pricing, availability) → ORM models
  • Pricing & availability are server-authored (single source of truth)
  • Every response uses a standard envelope (see API Overview)
```

**Key decisions:** money is stored as **integer cents**; the API emits **camelCase** so the
TypeScript frontend stays idiomatic; **pricing** lives in one module used by both the quote
endpoint and the booking transaction; **availability** is derived from bookings and re-checked
*inside* the booking transaction to prevent double-booking; listing deletes are **soft**
(`is_active=false`) to preserve booking history.

---

## Database Schema

Relational schema (SQLite). Money in integer cents.

| Table | Purpose | Key columns / relationships |
|---|---|---|
| `users` | Guests and hosts | `email` unique; `role` (guest\|host); `is_superhost` |
| `listings` | Properties | `host_id → users`; flat `city/country`; `price_per_night` (cents); `rating_avg/count`; `is_active` |
| `listing_photos` | Photos per listing | `listing_id → listings`; `sort_order`; `is_cover` |
| `amenities` | Amenity catalog | `name` unique |
| `listing_amenities` | Listing ↔ amenity | Many-to-many join table |
| `bookings` | Reservations | `listing_id`, `guest_id`; `check_in/check_out` (checkout exclusive); cents snapshot; `status` |
| `reviews` | Post-stay reviews | `listing_id`, `booking_id`, `author_id`; `rating` 1–5 |
| `wishlists` | Favorites | unique `(user_id, listing_id)` |

**Relationships:** users 1—N listings (host) and 1—N bookings (guest); listings 1—N
photos/bookings/reviews and N—N amenities; users N—N listings via wishlists.

**Availability / overlap rule:** a requested range `[in, out)` conflicts with an existing
non-cancelled booking when `existing.check_in < out AND existing.check_out > in`.

---

## API Overview

All routes are under `/api`. Responses are camelCase JSON, wrapped in a standard
envelope so the client always gets a predictable shape:

```jsonc
// success
{ "statusCode": 200, "data": { /* payload */ }, "message": "…", "success": true }
// error
{ "statusCode": 409, "message": "Those dates are no longer available",
  "success": false, "errors": [] }
```

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account (auto-login), returns `{token, user}` |
| POST | `/api/auth/login` | — | Log in, returns `{token, user}` |
| POST | `/api/auth/logout` | — | Stateless acknowledgment |
| POST | `/api/auth/switch-role` | ✔ | Toggle guest/host, re-issue token |
| GET | `/api/users/me` | ✔ | Current user |
| GET | `/api/listings` | — | Search/filter/paginate |
| GET | `/api/listings/mine` | host | Your own listings |
| GET | `/api/listings/{id}` | — | Listing detail |
| POST | `/api/listings` | host | Create listing |
| PATCH | `/api/listings/{id}` | owner | Update listing |
| DELETE | `/api/listings/{id}` | owner | Soft-delete listing |
| GET | `/api/listings/{id}/availability` | — | Booked date ranges |
| POST | `/api/listings/{id}/quote` | — | Price breakdown |
| GET | `/api/listings/{id}/reviews` | — | Reviews |
| POST | `/api/listings/{id}/reviews` | ✔ | Review (after a completed stay) |
| GET | `/api/listings/{id}/bookings` | owner | Bookings on a listing |
| POST | `/api/bookings` | ✔ | Create booking (409 on conflict) |
| GET | `/api/bookings/me` | ✔ | My Trips |
| PATCH | `/api/bookings/{id}/cancel` | ✔ | Cancel |
| GET/POST | `/api/wishlist` | ✔ | List / add favorite |
| DELETE | `/api/wishlist/{listing_id}` | ✔ | Remove favorite |
| GET | `/api/health` | — | Liveness |

Interactive API docs are available at `http://localhost:8000/docs` when the backend runs.

### Search / filter query parameters (`GET /api/listings`)
`location`, `guests`, `min_price` (cents), `max_price` (cents), `property_type`,
`amenities` (repeatable), `check_in`/`check_out` (ISO dates — excludes listings with an
overlapping booking), `sort` (`newest|price_asc|price_desc|rating`), `page`, `limit`.

---

## Getting Started (Local)

Requires **Python 3.11+** and **Node.js 18+**. Run the two services in separate terminals.

### 1) Backend (FastAPI + SQLite)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # adjust SECRET_KEY etc. if you like
python seed.py                     # creates airbnb.db and seeds sample data
uvicorn main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (docs at `/docs`).

### 2) Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Open `http://localhost:3000`.

### Seed accounts (all password `password123`)
| Email | Role |
|---|---|
| `alice@example.com` | host (Superhost) |
| `bob@example.com` | host |
| `carol@example.com` | host |
| `dave@example.com` | guest |
| `erin@example.com` | guest |

Any user can toggle between guest and host from the header ("Switch to hosting").

---

## Deployment

- **Frontend → Vercel:** import `frontend/`, set `NEXT_PUBLIC_API_URL` to your deployed
  backend URL (with `/api`).
- **Backend → Render / Railway:** start command `uvicorn main:app --host 0.0.0.0 --port $PORT`;
  set `SECRET_KEY` and `CORS_ORIGINS` (your frontend origin). Run `python seed.py` once to
  populate data. For persistence across restarts, mount a volume for `airbnb.db` (or point
  `DATABASE_URL` at a managed database).

---

## Assumptions & Limitations

- **Auth is simplified but real.** Passwords are bcrypt-hashed and sessions are stateless
  JWTs. The token is stored in a readable `token` cookie so the axios client can send it and
  Next.js middleware can gate protected pages; **all authorization is enforced server-side**.
  A production build would use httpOnly cookies via a same-site proxy/BFF.
- **Mocked per the brief:** payment processing (Reserve confirms instantly), guest↔host
  messaging, identity verification, and a live pricing map (coordinates are modeled; a static
  map is used).
- **Availability** is derived from bookings; there is no separate host block-out calendar in
  the MVP.
- **Money** is stored as integer cents and formatted only in the UI.
- **SQLite** is used as specified; the ORM layer means the schema ports to Postgres with
  minimal changes if needed for scale.

---

## Testing the API

With the backend running (Swagger UI at `/docs`, or FastAPI's `TestClient`), the flows
you can exercise end-to-end are: health, paginated search, location/price/amenity filters,
signup/login (+ bad-credential handling), listing detail, price quote, booking creation,
overlap rejection (409), date validation (422), My Trips, host-only guards (403), ownership
checks, review gating, and wishlist add/list/remove.
