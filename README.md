# StayFinder

An Airbnb-style booking app I built for the SDE Fullstack assignment. You can browse and
search stays, open a listing, filter results, book a date range (with availability checks so
you can't double-book), and switch into host mode to manage your own listings. The UI is meant
to feel like Airbnb.

**Live demo**
- App: https://stayfinder-phi-jet.vercel.app
- API: https://airbnb-clone-api-obpg.onrender.com/api
- API docs (Swagger): https://airbnb-clone-api-obpg.onrender.com/docs
- Code: https://github.com/Niranjani-sharma/AIRBNB_CLONE  <!-- replace with your exact repo URL -->

Note: the backend is on Render's free tier, so if it's been idle the first request can take
30–45 seconds to wake up. After that it's fast.

## Tech stack

- Frontend: Next.js 14 (App Router) with TypeScript and Tailwind
- Backend: Python with FastAPI
- Database: SQLite through SQLAlchemy (schema is my own)
- Auth: JWT, passwords hashed with bcrypt

## What it does

- Home/explore grid with a search bar, category row, and filters (price, property type, amenities)
- Listing page with a photo gallery, amenities, availability calendar, price breakdown, reviews, host info and a map
- Booking flow with a mocked checkout; bookings persist and block those dates
- My Trips, wishlist, and a host side (dashboard + a step-by-step create/edit flow)
- One account can act as both guest and host by switching roles

## Project structure

```
airbnb/
├── backend/     FastAPI + SQLite
├── frontend/    Next.js app
└── README.md
```

The backend is split by resource. Routes stay thin and hand off to controllers; the ORM models
live in `models/`, request/response shapes in `schemas/`, and the shared logic (pricing,
availability, auth helpers) sits in `utils/`. Pricing and availability are done on the server so
the client never makes up its own totals.

## Running it locally

You'll need Python 3.11+ and Node 18+. Run the backend and frontend in two terminals.

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py                   # creates airbnb.db with sample data
uvicorn main:app --reload --port 8000
```

API runs at http://localhost:8000 (docs at /docs).

**Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local # set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
npm run dev
```

Open http://localhost:3000.

**Test accounts** (password is `password123` for all):

| Email | Role |
|---|---|
| alice@example.com | host (Superhost) |
| bob@example.com | host |
| carol@example.com | host |
| dave@example.com | guest |
| erin@example.com | guest |

`dave` and `erin` already have past and upcoming bookings, so Trips and the review flow have
something to show. Any account can switch between guest and host from the header.

## Database schema

Everything's in SQLite. Money is stored as integer cents to avoid float rounding, and formatted
only when it's shown.

| Table | What it holds |
|---|---|
| users | guests and hosts; unique email, role, superhost flag |
| listings | properties; FK to host, city/country, price in cents, rating average/count, active flag |
| listing_photos | photos for a listing, with cover + sort order |
| amenities | amenity names |
| listing_amenities | join table between listings and amenities (many-to-many) |
| bookings | check-in/check-out (checkout is exclusive), a price snapshot in cents, status |
| reviews | rating 1–5 and a comment, tied to a listing/booking/author |
| wishlists | saved listings, unique per (user, listing) |

A user has many listings (as host) and many bookings (as guest). A listing has many photos,
bookings and reviews, and many amenities.

For availability, I don't keep a separate blocked-dates table — it's derived from the bookings.
A requested range `[in, out)` clashes with an existing (non-cancelled) booking when
`existing.check_in < out AND existing.check_out > in`. That check runs inside the booking
transaction, so two people can't grab the same dates.

Deleting a listing is a soft delete (`is_active=false`) so existing bookings and history aren't lost.

## API

Everything lives under `/api`. Responses come back as camelCase JSON wrapped in a small envelope:

```jsonc
{ "statusCode": 200, "data": { }, "message": "...", "success": true }
```

Errors use the same shape with `success: false` and a `message`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | — | create account, returns token + user |
| POST | /api/auth/login | — | log in |
| POST | /api/auth/logout | — | stateless |
| POST | /api/auth/switch-role | yes | toggle guest/host, returns a new token |
| GET | /api/users/me | yes | current user |
| GET | /api/listings | — | search / filter / paginate |
| GET | /api/listings/mine | host | your listings |
| GET | /api/listings/{id} | — | listing detail |
| POST | /api/listings | host | create |
| PATCH | /api/listings/{id} | owner | update |
| DELETE | /api/listings/{id} | owner | soft-delete |
| GET | /api/listings/{id}/availability | — | booked date ranges |
| POST | /api/listings/{id}/quote | — | price breakdown |
| GET | /api/listings/{id}/reviews | — | reviews |
| POST | /api/listings/{id}/reviews | yes | review (only after a completed stay) |
| GET | /api/listings/{id}/bookings | owner | bookings on your listing |
| POST | /api/bookings | yes | book (returns 409 if the dates clash) |
| GET | /api/bookings/me | yes | my trips |
| PATCH | /api/bookings/{id}/cancel | yes | cancel |
| GET / POST | /api/wishlist | yes | list / add |
| DELETE | /api/wishlist/{listing_id} | yes | remove |
| GET | /api/health | — | health check |

Search params on `GET /api/listings`: `location`, `guests`, `min_price`, `max_price` (both in
cents), `property_type`, `amenities` (repeatable), `check_in`/`check_out`, `sort`
(`newest`, `price_asc`, `price_desc`, `rating`), `page`, `limit`.

The easiest way to poke at the API is the Swagger page at `/docs`.

## Deployment

Backend is on Render, frontend on Vercel. Deploy the backend first so you have its URL, then
set that as the frontend's API base, then add the frontend origin to the backend's allowed
CORS origins.

Backend (Render): root dir `backend`, install `pip install -r requirements.txt`, start
`uvicorn src.app:app --host 0.0.0.0 --port $PORT`, health check `/api/health`. Env vars:
`SECRET_KEY`, `CORS_ORIGINS` (the Vercel URL), and `SEED_ON_START=true` so it seeds on first
boot (Render's free disk is wiped on redeploys; a non-empty DB is left alone). For data that
survives restarts you'd attach a persistent disk or move to Postgres.

Frontend (Vercel): root dir `frontend`, set `NEXT_PUBLIC_API_BASE_URL` to the Render URL plus
`/api`. Vercel picks up Next.js on its own.

## Assumptions and what's mocked

- Auth is simplified but real: bcrypt-hashed passwords and stateless JWTs. All the actual
  authorization (host-only routes, "can this user edit this listing") is checked on the server.
- Mocked, as the brief allows: payments (Reserve just confirms), messaging, identity
  verification, and the live pricing map (I store lat/lng and show a basic map).
- Photos are stored as image URLs — there's no file-upload endpoint, so the host form takes URLs.
- Reviews store one overall rating. The per-category bars and the review tag chips on the
  listing page are cosmetic and derived from that rating / the review text, not separate data.
- The "Guest favourite" badge is a UI-only touch shown for highly rated listings.
- Prices show in ₹ for the demo, but are stored as integer cents internally.
- SQLite is used as specified. Since it's behind SQLAlchemy, moving to Postgres later wouldn't
  take much.
