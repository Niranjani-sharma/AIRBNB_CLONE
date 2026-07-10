"""Seed the SQLite database with a variety of listings, hosts, guests,
bookings and reviews so the app is immediately usable.

Run from the backend/ directory:  python seed.py
Idempotent: drops and recreates all tables each run.
"""
from __future__ import annotations

import datetime as dt

from src.db import Base, SessionLocal, engine
from src.models import Amenity, Booking, Listing, ListingPhoto, Review, User, Wishlist
from src.utils.pricing import quote
from src.utils.security import hash_password

TODAY = dt.date.today()

AMENITIES = [
    "WiFi", "Kitchen", "Washer", "Air conditioning", "Heating", "Pool",
    "Free parking", "Hot tub", "TV", "Workspace", "Fireplace", "Gym",
    "Beach access", "Pets allowed", "EV charger",
]

# (title, type, city, country, price$/night, cleaning$, guests, br, beds, ba, [amenities], [photo urls])
LISTINGS = [
    ("Sunlit Loft in the Arts District", "apartment", "Los Angeles", "USA", 182, 55, 4, 1, 2, 1.0,
     ["WiFi", "Kitchen", "Air conditioning", "Workspace", "TV"],
     ["photo-1502672260266-1c1ef2d93688", "photo-1522708323590-d24dbb6b0267", "photo-1493809842364-78817add7ffb"]),
    ("Cozy Cabin with Mountain Views", "cabin", "Aspen", "USA", 320, 90, 6, 3, 4, 2.0,
     ["WiFi", "Kitchen", "Heating", "Fireplace", "Hot tub", "Free parking"],
     ["photo-1449158743715-0a90ebb6d2d8", "photo-1518780664697-55e3ad937233", "photo-1416331108676-a22ccb276e35"]),
    ("Beachfront Bungalow", "house", "Malibu", "USA", 540, 120, 5, 2, 3, 2.0,
     ["WiFi", "Beach access", "Kitchen", "Air conditioning", "Free parking"],
     ["photo-1499793983690-e29da59ef1c2", "photo-1512917774080-9991f1c4c750", "photo-1600585154340-be6161a56a0c"]),
    ("Modern Studio Downtown", "apartment", "New York", "USA", 210, 60, 2, 0, 1, 1.0,
     ["WiFi", "Kitchen", "Air conditioning", "Gym", "TV"],
     ["photo-1502672260266-1c1ef2d93688", "photo-1489171078254-c3365d6e359f", "photo-1484154218962-a197022b5858"]),
    ("Charming Cottage by the Lake", "cottage", "Lake Tahoe", "USA", 265, 75, 4, 2, 2, 1.5,
     ["WiFi", "Kitchen", "Heating", "Fireplace", "Free parking", "Pets allowed"],
     ["photo-1568605114967-8130f3a36994", "photo-1449824913935-59a10b8d2000", "photo-1520250497591-112f2f40a3f4"]),
    ("Luxury Villa with Infinity Pool", "villa", "Miami", "USA", 780, 200, 8, 4, 5, 4.0,
     ["WiFi", "Pool", "Kitchen", "Air conditioning", "Free parking", "Hot tub", "Gym"],
     ["photo-1613490493576-7fde63acd811", "photo-1512918728675-ed5a9ecdebfd", "photo-1600607687939-ce8a6c25118c"]),
    ("Rustic Farmhouse Retreat", "house", "Napa", "USA", 295, 85, 6, 3, 3, 2.0,
     ["WiFi", "Kitchen", "Heating", "Fireplace", "Free parking", "EV charger"],
     ["photo-1505691938895-1758d7feb511", "photo-1484154218962-a197022b5858", "photo-1502005229762-cf1b2da7c5d6"]),
    ("Chic Downtown Penthouse", "apartment", "Chicago", "USA", 410, 100, 4, 2, 2, 2.0,
     ["WiFi", "Kitchen", "Air conditioning", "Gym", "Workspace", "TV"],
     ["photo-1522708323590-d24dbb6b0267", "photo-1493809842364-78817add7ffb", "photo-1560448204-e02f11c3d0e2"]),
    ("Seaside Cottage Escape", "cottage", "San Diego", "USA", 230, 70, 3, 1, 2, 1.0,
     ["WiFi", "Beach access", "Kitchen", "Air conditioning", "Pets allowed"],
     ["photo-1512917774080-9991f1c4c750", "photo-1600585154340-be6161a56a0c", "photo-1449824913935-59a10b8d2000"]),
    ("Desert Oasis with Hot Tub", "house", "Palm Springs", "USA", 350, 95, 6, 3, 3, 2.0,
     ["WiFi", "Pool", "Hot tub", "Kitchen", "Air conditioning", "Free parking"],
     ["photo-1600607687939-ce8a6c25118c", "photo-1613490493576-7fde63acd811", "photo-1512918728675-ed5a9ecdebfd"]),
    ("Skyline Apartment", "apartment", "Seattle", "USA", 240, 65, 3, 1, 2, 1.0,
     ["WiFi", "Kitchen", "Air conditioning", "Workspace", "TV"],
     ["photo-1502672260266-1c1ef2d93688", "photo-1489171078254-c3365d6e359f", "photo-1560448204-e02f11c3d0e2"]),
    ("Hill Country Bungalow", "house", "Austin", "USA", 275, 80, 5, 2, 3, 2.0,
     ["WiFi", "Kitchen", "Free parking", "Air conditioning", "Pets allowed"],
     ["photo-1505691938895-1758d7feb511", "photo-1484154218962-a197022b5858", "photo-1502005229762-cf1b2da7c5d6"]),
    ("Mountain Modern Retreat", "cabin", "Denver", "USA", 310, 85, 6, 3, 4, 2.0,
     ["WiFi", "Kitchen", "Heating", "Fireplace", "Hot tub", "Free parking"],
     ["photo-1449158743715-0a90ebb6d2d8", "photo-1518780664697-55e3ad937233", "photo-1416331108676-a22ccb276e35"]),
    ("Riverside Cottage", "cottage", "Portland", "USA", 205, 60, 3, 1, 2, 1.0,
     ["WiFi", "Kitchen", "Heating", "Fireplace", "Pets allowed"],
     ["photo-1568605114967-8130f3a36994", "photo-1449824913935-59a10b8d2000", "photo-1520250497591-112f2f40a3f4"]),
    ("Music Row Loft", "apartment", "Nashville", "USA", 230, 70, 4, 1, 2, 1.5,
     ["WiFi", "Kitchen", "Air conditioning", "TV", "Workspace"],
     ["photo-1522708323590-d24dbb6b0267", "photo-1493809842364-78817add7ffb", "photo-1502672260266-1c1ef2d93688"]),
    ("Historic Brownstone", "house", "Boston", "USA", 360, 95, 6, 3, 3, 2.5,
     ["WiFi", "Kitchen", "Heating", "Free parking", "Washer"],
     ["photo-1600585154340-be6161a56a0c", "photo-1512917774080-9991f1c4c750", "photo-1499793983690-e29da59ef1c2"]),
]

UNSPLASH = "https://images.unsplash.com/{}?auto=format&fit=crop&w=1200&q=80"

# Approximate city coordinates so the listing-detail map has a location to plot.
CITY_COORDS = {
    "Los Angeles": (34.0522, -118.2437),
    "Aspen": (39.1911, -106.8175),
    "Malibu": (34.0259, -118.7798),
    "New York": (40.7128, -74.0060),
    "Lake Tahoe": (39.0968, -120.0324),
    "Miami": (25.7617, -80.1918),
    "Napa": (38.2975, -122.2869),
    "Chicago": (41.8781, -87.6298),
    "San Diego": (32.7157, -117.1611),
    "Palm Springs": (33.8303, -116.5453),
    "Seattle": (47.6062, -122.3321),
    "Austin": (30.2672, -97.7431),
    "Denver": (39.7392, -104.9903),
    "Portland": (45.5152, -122.6784),
    "Nashville": (36.1627, -86.7816),
    "Boston": (42.3601, -71.0589),
}


def dollars(n: int) -> int:
    return n * 100


def reset_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def run() -> None:
    reset_db()
    db = SessionLocal()
    try:
        pw = hash_password("password123")

        # --- amenities ---
        amenity_map = {name: Amenity(name=name) for name in AMENITIES}
        db.add_all(amenity_map.values())

        # --- users: 3 hosts (1 superhost) + 2 guests ---
        alice = User(name="Alice Nguyen", email="alice@example.com", password_hash=pw,
                     role="host", is_superhost=True,
                     avatar_url="https://i.pravatar.cc/150?img=47")
        bob = User(name="Bob Martins", email="bob@example.com", password_hash=pw,
                   role="host", avatar_url="https://i.pravatar.cc/150?img=12")
        carol = User(name="Carol Diaz", email="carol@example.com", password_hash=pw,
                     role="host", avatar_url="https://i.pravatar.cc/150?img=32")
        dave = User(name="Dave Park", email="dave@example.com", password_hash=pw,
                    role="guest", avatar_url="https://i.pravatar.cc/150?img=68")
        erin = User(name="Erin Kelly", email="erin@example.com", password_hash=pw,
                    role="guest", avatar_url="https://i.pravatar.cc/150?img=45")
        hosts = [alice, bob, carol]
        db.add_all([alice, bob, carol, dave, erin])
        db.flush()

        # --- listings ---
        listings: list[Listing] = []
        for i, spec in enumerate(LISTINGS):
            (title, ptype, city, country, price, cleaning, guests, br, beds, ba,
             ams, photos) = spec
            host = hosts[i % len(hosts)]
            listing = Listing(
                host_id=host.id,
                title=title,
                description=(
                    f"{title}. A wonderful {ptype} in {city}, perfect for up to "
                    f"{guests} guests. Thoughtfully designed with everything you need "
                    f"for a memorable stay."
                ),
                property_type=ptype,
                city=city,
                country=country,
                latitude=CITY_COORDS.get(city, (None, None))[0],
                longitude=CITY_COORDS.get(city, (None, None))[1],
                price_per_night=dollars(price),
                cleaning_fee=dollars(cleaning),
                service_fee_pct=0.14,
                max_guests=guests,
                bedrooms=br,
                beds=beds,
                bathrooms=ba,
            )
            listing.amenities = [amenity_map[a] for a in ams]
            listing.photos = [
                ListingPhoto(url=UNSPLASH.format(pid), sort_order=j, is_cover=(j == 0))
                for j, pid in enumerate(photos)
            ]
            db.add(listing)
            listings.append(listing)
        db.flush()

        # --- bookings: one past (completed) + one future (confirmed) per few listings ---
        guests_users = [dave, erin]
        for idx, listing in enumerate(listings):
            guest = guests_users[idx % 2]

            # Past stay (enables reviews + shows completed trips)
            past_in = TODAY - dt.timedelta(days=30 + idx)
            past_out = past_in + dt.timedelta(days=4)
            pb = quote(
                nightly_rate=listing.price_per_night,
                cleaning_fee=listing.cleaning_fee,
                service_fee_pct=listing.service_fee_pct,
                check_in=past_in,
                check_out=past_out,
            )
            past_booking = Booking(
                listing_id=listing.id, guest_id=guest.id,
                check_in=past_in, check_out=past_out, guests_count=2,
                nightly_rate=pb.nightly_rate, cleaning_fee=pb.cleaning_fee,
                service_fee=pb.service_fee, taxes=pb.taxes, total_price=pb.total,
                status="confirmed",
            )
            db.add(past_booking)
            db.flush()

            # Review for the completed stay
            rating = 5 - (idx % 3)
            db.add(Review(
                listing_id=listing.id, booking_id=past_booking.id, author_id=guest.id,
                rating=rating, comment="Fantastic stay — clean, comfortable and exactly as pictured.",
            ))

            # Future stay on the first few listings (blocks those dates)
            if idx < 5:
                fut_in = TODAY + dt.timedelta(days=10 + idx * 3)
                fut_out = fut_in + dt.timedelta(days=3)
                fb = quote(
                    nightly_rate=listing.price_per_night,
                    cleaning_fee=listing.cleaning_fee,
                    service_fee_pct=listing.service_fee_pct,
                    check_in=fut_in,
                    check_out=fut_out,
                )
                db.add(Booking(
                    listing_id=listing.id, guest_id=guest.id,
                    check_in=fut_in, check_out=fut_out, guests_count=2,
                    nightly_rate=fb.nightly_rate, cleaning_fee=fb.cleaning_fee,
                    service_fee=fb.service_fee, taxes=fb.taxes, total_price=fb.total,
                    status="confirmed",
                ))

        # Recompute rating aggregates
        db.flush()
        for listing in listings:
            ratings = [r.rating for r in listing.reviews]
            if ratings:
                listing.rating_avg = round(sum(ratings) / len(ratings), 2)
                listing.rating_count = len(ratings)

        # A couple of wishlist entries
        db.add(Wishlist(user_id=dave.id, listing_id=listings[2].id))
        db.add(Wishlist(user_id=erin.id, listing_id=listings[5].id))

        db.commit()
        print(f"Seeded {len(listings)} listings, 5 users, bookings + reviews.")
        print("Login with any of: alice@ / bob@ / carol@ (hosts), dave@ / erin@ (guests)")
        print("Password for all: password123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
