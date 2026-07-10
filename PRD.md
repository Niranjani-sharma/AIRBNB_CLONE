# Product Requirements Document (PRD)
## Airbnb Web App Clone — SDE Fullstack Assignment

| Field | Value |
|---|---|
| Document Version | 3.0 |
| Status | Approved for Build |
| Last Updated | July 10, 2026 |
| Estimated Effort | ~24 hours |
| **Stack** | **Next.js 14 (App Router, TypeScript) · Python FastAPI · SQLite (SQLAlchemy) · JWT auth** |
| Repo Layout | Two services: `frontend/` (Next.js) + `backend/` (FastAPI) |

> **Alignment note.** This PRD follows the assignment's prescribed stack exactly:
> **Next.js (TypeScript)** frontend, **Python + FastAPI** backend, **SQLite** with a
> self-designed schema. The frontend borrows UI/interaction *patterns* from a Next.js
> reference project only; every other technology choice comes from the assignment brief.

---

## 1. Overview

### 1.1 Purpose
Build a functional, visually faithful clone of the Airbnb marketplace that replicates its design language, UX patterns, and core booking workflows. The app must feel like a photo-forward Airbnb marketplace rather than a generic listings CRUD app. It ships as two deployable services: a Next.js frontend and a FastAPI backend backed by SQLite.

### 1.2 Problem Statement
Guests need to discover, evaluate, and book short-term stays; hosts need to list and manage their own properties. This clone demonstrates end-to-end mastery of a real-world marketplace: browse → search → filter → view → book → manage, with authenticated, ownership-scoped actions and a correctly modeled relational database.

### 1.3 Scope Philosophy
- **In scope:** browse/search/filter, listing detail, end-to-end booking with availability enforcement, host CRUD, wishlist, reviews, guest/host roles, Airbnb-grade UI.
- **Mocked (per brief):** payments (mock checkout), messaging, real-time map with live pins (static/basic map), identity verification. Auth is simplified but real (hashed passwords + JWT) and enforces a guest/host distinction.
- **Out of scope:** real payment rails, real third-party APIs, OAuth/2FA/RBAC beyond guest–host, microservices, native mobile apps (responsive web only).

### 1.4 Success Criteria (from the Evaluation Rubric)

| Criteria | Definition of Done |
|---|---|
| Functionality | All core features work: search, availability, booking flow end-to-end |
| UI/UX | Strong visual similarity to Airbnb; matching UX patterns |
| Database Design | Well-structured relational schema with proper relationships & constraints |
| Backend / API Design | Clean, RESTful FastAPI routers; sensible layering |
| Code Quality | Clean, readable, typed (TS on the frontend, Pydantic/typing on the backend) |
| Code Modularity | Separation of concerns; reusable components and services |
| Code Understanding | Every line explainable in the evaluation interview |

---

## 2. Goals & Non-Goals

### 2.1 Goals
1. Recreate Airbnb's explore/home grid, listing detail, and booking flow with high visual fidelity.
2. Provide a clean FastAPI REST backend with a well-designed SQLite schema.
3. Enforce booking correctness: no overlapping/unavailable dates; bookings persist and block dates; availability re-checked inside the write transaction.
4. Provide full host CRUD with an owned-listings dashboard and server-side ownership checks.
5. Ship a seeded, immediately usable app (variety of listings + hosts + existing bookings + reviews).
6. Deploy publicly (frontend + backend) with a working demo link and a thorough README.

### 2.2 Non-Goals
- Real payment processing, real emails/SMS, real KYC.
- OAuth / 2FA / fine-grained RBAC beyond the guest–host distinction.
- Microservices — two clean services (frontend + backend) is the target.

---

## 3. Personas & Roles

| Persona | Description | Primary Jobs |
|---|---|---|
| Guest | Traveler searching for a stay | Browse, search, filter, view detail, book, manage trips, wishlist, review |
| Host | Property owner | Create/edit/delete listings, view dashboard, see bookings on their listings |
| Dual user | Acts as both | Toggle between guest & host contexts |

A user carries an authenticated identity plus an active-context `role` (`guest` vs `host`), embedded in the JWT and toggled via `POST /api/auth/switch-role` (which re-issues the token). The guest/host distinction is **mandatory** and enforced server-side on every host mutation.

---

## 4. User Stories & Acceptance Criteria

### Epic Z — Authentication (simplified but real)
- **Z1** Sign up with name, email, password, and initial role. *AC: password bcrypt-hashed; duplicate email → 400; signup auto-logs-in via a returned JWT.*
- **Z2** Log in and receive a JWT. *AC: wrong credentials → 400.*
- **Z3** Log out (client discards token) and protected pages redirect to `/login`.
- **Z4** Switch between guest and host contexts; the new role is reflected in the re-issued token.

### Epic A — Home & Search
- **A1** Responsive grid of listing cards (photo, title, location, price/night, rating).
- **A2** Search by location + date range + guests. *AC: search pill mirrors Airbnb; filters the grid server-side.*
- **A3** Refine via category/filter row (price range, property type, amenities). *AC: filters compose; reflected in URL query params.*
- **A4** Page through results via pagination. *AC: server returns paged results with total/totalPages.*

### Epic B — Listing Detail
- **B1** Photo gallery, title, description, location, amenities, host info.
- **B2** Availability calendar / date-range picker driven by existing bookings.
- **B3** Price breakdown: `nightly × nights + cleaning fee + service fee + taxes = total`.
- **B4** Reviews section (rating aggregate + individual reviews).

### Epic C — Booking Flow
- **C1** Select date range + guest count with validation (no overlap, within `maxGuests`, checkout > checkin, not in the past). *AC: validated client- and server-side; server is source of truth.*
- **C2** Booking summary → mocked checkout → confirmation.
- **C3** View **My Trips** with derived status (upcoming/completed/cancelled).
- **C4** Bookings persist and block those dates. *AC: availability re-checked inside the booking transaction → 409 on conflict, no partial write.*

### Epic D — Host Experience (CRUD)
- **D1** Create a listing (title, description, photos via URL, price, location, amenities).
- **D2** Edit and delete owned listings (soft-delete preserves history).
- **D3** Host dashboard of owned listings; per-listing bookings endpoint.
- **D4** Data persists. *AC: a host can only mutate listings they own (server-side ownership check keyed off the JWT user id).*

### Epic E — Airbnb Experience
- **E1** Navigation & layout (explore grid + detail view + sticky header + search pill).
- **E2** Cards, galleries, date pickers, modals behave like Airbnb.
- **E3** Search, filters, pagination present.
- **E4** Toast notifications on key actions.
- **E5** Wishlist / favorites (heart toggle + saved view).

---

## 5. Feature Specifications (Detailed)

### 5.1 Home / Explore
Header with logo, centered search pill (location + guests), and a user menu (switch role, trips, wishlist, dashboard, log out). A horizontally scrollable category row applies a `property_type` filter. The responsive grid (1–4 columns) renders cover image, wishlist heart, title, location, price, and rating. Empty state: "No stays match your search."

### 5.2 Listing Detail
Photo gallery (hero + grid), an info column (title, `★ rating · N reviews · location`, host block with Superhost badge, description, amenities grid), a sticky booking card (price/night, date pickers, guest selector, live price breakdown from the `quote` endpoint, Reserve CTA), and a reviews section with a gated review form.

### 5.3 Booking Flow
Guest picks dates + guests → client validates → Reserve calls `POST /api/bookings`, which re-validates availability inside the transaction, snapshots the price breakdown (in cents), and persists. On success: toast + redirect to My Trips; the dates are now blocked. On conflict: a friendly 409 with no partial write. Statuses: `confirmed → completed` (past check-out, derived) / `cancelled`.

### 5.4 Host CRUD & Dashboard
Create/edit form (title, description, price/night, cleaning fee, location, property type, max guests, amenities, photo URLs). Prices are entered in dollars and stored in cents. Dashboard lists the host's own listings (via `GET /api/listings/mine`) with edit/delete. Delete is a **soft delete** (`is_active=false`) to preserve booking history.

### 5.5 Wishlist / Favorites
Heart toggle on cards; persisted per user with a unique `(user_id, listing_id)` constraint; a Wishlist view.

### 5.6 Notifications / Toasts
`react-hot-toast` on signup/login/logout, booking confirmed, listing created/updated/deleted, wishlist add/remove, and validation failures.

---

## 6. Mocked / Placeholder Sections

| Section | Treatment |
|---|---|
| Payments | Mock checkout ("Reserve" confirms instantly); no real gateway |
| Messaging (guest↔host) | "Coming Soon" placeholder |
| Real-time map w/ live pins | Interactive map implemented (Leaflet + OpenStreetMap, listing pins) |
| Identity verification | "Coming Soon" placeholder |

---

## 7. Data Model / Database Schema

**Engine:** SQLite via SQLAlchemy 2.0 ORM. Schema is self-designed and evaluated. Money is stored as **integer cents**. Amenities use a proper **many-to-many** join table; photos are a child table.

### 7.1 Tables

**users** — `id (PK)`, `name`, `email (unique, indexed)`, `password_hash`, `avatar_url`, `role (guest|host)`, `is_superhost`, `created_at`.

**amenities** — `id (PK)`, `name (unique)`.

**listing_amenities** (association) — `listing_id (FK)`, `amenity_id (FK)`, composite PK.

**listings** — `id (PK)`, `host_id (FK→users, indexed)`, `title`, `description`, `property_type (indexed)`, `city (indexed)`, `country`, `latitude`, `longitude`, `price_per_night (cents)`, `cleaning_fee (cents)`, `service_fee_pct`, `max_guests`, `bedrooms`, `beds`, `bathrooms`, `rating_avg`, `rating_count`, `is_active (soft-delete, indexed)`, `created_at`.

**listing_photos** — `id (PK)`, `listing_id (FK→listings, indexed)`, `url`, `sort_order`, `is_cover`.

**bookings** — `id (PK)`, `listing_id (FK, indexed)`, `guest_id (FK, indexed)`, `check_in`, `check_out (exclusive)`, `guests_count`, cents snapshot (`nightly_rate`, `cleaning_fee`, `service_fee`, `taxes`, `total_price`), `status (indexed)`, `created_at`.

**reviews** — `id (PK)`, `listing_id (FK)`, `booking_id (FK, nullable)`, `author_id (FK)`, `rating (1–5)`, `comment`, `created_at`.

**wishlists** — `id (PK)`, `user_id (FK)`, `listing_id (FK)`, unique `(user_id, listing_id)`, `created_at`.

### 7.2 Relationships
- users **1—N** listings (host); users **1—N** bookings (guest).
- listings **1—N** photos, bookings, reviews.
- listings **N—N** amenities (via `listing_amenities`).
- users **N—N** listings (via `wishlists`).

### 7.3 Key Constraints & Rules
- `users.email` unique; `wishlists (user_id, listing_id)` unique.
- Rating constrained to 1–5; `guests_count ≥ 1`; `check_out > check_in`.
- **Overlap rule** (application-enforced inside the booking transaction): a request `[in, out)` conflicts if `existing.check_in < out AND existing.check_out > in`, for the same listing, `status ≠ cancelled`.

### 7.4 Availability Model
Availability is derived from `bookings` (no separate blocked-dates table in the MVP), which keeps the schema lean and the source of truth singular.

---

## 8. API Design (FastAPI REST)

**Conventions:** JSON; RESTful plural nouns; proper status codes (200/201/204/400/401/403/404/409/422); Pydantic validation; camelCase field names in responses (via alias generator) so the TS frontend stays idiomatic; all routes under `/api`.

### 8.1 Auth & Users
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account (bcrypt hash) → returns `{token, user}` |
| POST | `/api/auth/login` | Verify credentials → `{token, user}` |
| POST | `/api/auth/logout` | Stateless acknowledgment |
| POST | `/api/auth/switch-role` | Toggle guest/host, re-issue token |
| GET | `/api/users/me` | Current authenticated user |

### 8.2 Listings
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/listings` | Search/filter/paginate (`location, guests, min_price, max_price, property_type, amenities[], sort, page, limit`) |
| GET | `/api/listings/mine` | Host's own listings (declared before `/{id}`) |
| GET | `/api/listings/{id}` | Detail incl. photos, amenities, host, rating |
| POST | `/api/listings` | Host create |
| PATCH | `/api/listings/{id}` | Owner update |
| DELETE | `/api/listings/{id}` | Owner soft-delete |
| GET | `/api/listings/{id}/availability` | Booked date ranges |
| POST | `/api/listings/{id}/quote` | Server-computed price breakdown |
| GET | `/api/listings/{id}/reviews` | Reviews for a listing |
| POST | `/api/listings/{id}/reviews` | Review (only after a completed stay) |
| GET | `/api/listings/{id}/bookings` | Owner: bookings on a listing |

### 8.3 Bookings
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/bookings` | Create (availability re-check in txn) → 201 or 409 |
| GET | `/api/bookings/me` | My Trips (status derived) |
| PATCH | `/api/bookings/{id}/cancel` | Cancel own upcoming booking |

### 8.4 Wishlist / Health
| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/api/wishlist` | List / add favorite |
| DELETE | `/api/wishlist/{listing_id}` | Remove favorite |
| GET | `/api/health` | Liveness probe |

---

## 9. Architecture (Two Services)

```
airbnb/
  backend/                      # Python FastAPI + SQLite
    app/
      main.py                   # app, CORS, router mounting, table creation
      config.py                 # env-driven settings (no secrets in code)
      database.py               # SQLAlchemy engine / session / Base
      models.py                 # ORM tables
      schemas.py                # Pydantic DTOs (camelCase output)
      security.py               # bcrypt + JWT (PyJWT)
      deps.py                   # get_current_user / require_host
      pricing.py                # single source of truth for totals
      availability.py           # overlap logic
      serializers.py            # ORM -> schema
      routers/                  # auth, users, listings, bookings, wishlist, health
    seed.py                     # deterministic seed
    requirements.txt  .env.example
  frontend/                     # Next.js (App Router, TypeScript)
    src/
      app/                      # explore, listing detail, login/signup, trips,
                                #   wishlist, host/dashboard + listing forms
      components/               # Header, cards, gallery, booking, filters, ui
      lib/                      # api (axios), auth (token cookie), types, format
      middleware.ts             # presence-gate for protected pages
    package.json  next.config.js  .env.local.example
```

### 9.1 Request Flow
Browser → Next.js (Server Components fetch public listing data directly from the API for first paint; Client Components use an axios client that attaches the JWT) → FastAPI (`/api/**`) → SQLAlchemy → SQLite.

### 9.2 Key Decisions
- **Two services, shared contract.** The API emits camelCase; the frontend's `lib/types.ts` mirrors it exactly.
- **Layering (backend):** thin router → service (pricing, availability) / serializer → ORM model.
- **Pricing is server-authored** (`pricing.py`); `/quote` and the booking transaction both call it so the client never invents totals.
- **Auth:** stateless JWT (bcrypt + PyJWT). The token is returned in the body, stored client-side in a readable `token` cookie for Bearer headers + middleware redirect UX; **all authorization is enforced server-side**.
- **Money as integer cents**; formatted only in the UI.

---

## 10. Seed Data Requirements
`python seed.py` (deterministic; drops & recreates tables):
- 3 hosts (one Superhost) + 2 guests, all with password `password123`.
- 10 listings across cities/property types, each with multiple Unsplash photos, amenities, prices.
- A past (completed) booking + review per listing; future (confirmed) bookings on several so date-blocking and My Trips are visibly populated.
- Denormalized `rating_avg`/`rating_count` recomputed; two wishlist entries.

---

## 11. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Paginated queries; indexed hot paths; lazy-loaded images via `next/image` |
| Security (scoped) | bcrypt hashing; JWT; server-side ownership checks; Pydantic validation; parameterized queries via ORM; **no secrets in repo** (env only) |
| Reliability | Booking writes re-check availability in-transaction; no double-booking under the overlap rule |
| Usability | Keyboard-usable date pickers; alt text; visible focus states |
| Responsiveness | Mobile/tablet/desktop breakpoints (bonus) |
| Maintainability | Modular routers/components; typed contracts on both sides |

---

## 12. Deliverables & Submission
- Public GitHub repo containing `frontend/` and `backend/`.
- README: setup (both services), tech stack, architecture overview, database schema, API overview, assumptions.
- Hosted demo: frontend on **Vercel**; backend on **Render/Railway** (SQLite file or managed volume). Submit both links.
- Original work — no plagiarism.

---

## 13. Bonus Features (Prioritized)

| Priority | Feature | Status |
|---|---|---|
| High | Responsive design (mobile/tablet/desktop) | Implemented |
| High | Leave a review after a completed stay | Implemented (server-gated) |
| Med | Superhost badges / ratings aggregation | Implemented (denormalized aggregate + badge) |
| Med | Interactive map with listing pins | Implemented (Leaflet + OpenStreetMap; single-pin on detail, price pins on results) |
| Low | Dark mode | Implemented (class-based theme toggle, persisted; CSS-variable tokens) |
| Low | Image upload to cloud storage | Future (URL input now) |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Double-booking race | Data integrity | Availability re-check inside the booking transaction; 409 on conflict |
| Float money errors | Wrong totals | Integer cents everywhere; format only in UI |
| Client-computed prices diverge | Trust/UX | Server `/quote` + booking txn both call `pricing.py` |
| Cross-origin auth complexity | Broken login in dev | JWT in a readable cookie + Bearer header; CORS configured for the frontend origin |
| UI not "Airbnb enough" | Rubric (UI/UX) | Tailwind design tokens (rausch/foggy/hof); reuse card/gallery/date-picker patterns |

---

## 15. Definition of Done (Ship Checklist)
- [ ] Auth works: signup → login → protected routes → switch role → logout.
- [ ] All 5 core epics functional end-to-end.
- [ ] No double-booking possible; dates block after booking.
- [ ] Host can only edit/delete own listings (server-side ownership check).
- [ ] Server is the source of truth for availability & pricing.
- [ ] Seed data makes the app immediately usable.
- [ ] Airbnb-faithful, responsive UI with toasts, wishlist, modals.
- [ ] Public repo (`frontend/` + `backend/`) + complete README.
- [ ] Deployed demo links work.
- [ ] Every line explainable in the evaluation interview.
