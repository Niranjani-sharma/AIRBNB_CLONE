"""Pricing: the single source of truth for how a booking total is computed.

Both the /quote endpoint and the booking-creation transaction call quote()
so the client can never invent totals. All values are integer cents.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import asdict, dataclass

from .config import settings


@dataclass
class PriceBreakdown:
    nights: int
    nightly_rate: int  # cents
    subtotal: int  # nightly_rate * nights
    cleaning_fee: int
    service_fee: int
    taxes: int
    total: int

    def as_dict(self) -> dict:
        return asdict(self)


def nights_between(check_in: dt.date, check_out: dt.date) -> int:
    return (check_out - check_in).days


def quote(
    *,
    nightly_rate: int,
    cleaning_fee: int,
    service_fee_pct: float,
    check_in: dt.date,
    check_out: dt.date,
) -> PriceBreakdown:
    nights = nights_between(check_in, check_out)
    if nights < 1:
        raise ValueError("check_out must be after check_in")

    subtotal = nightly_rate * nights
    service_fee = round(subtotal * service_fee_pct)
    taxes = round((subtotal + cleaning_fee + service_fee) * settings.TAX_RATE)
    total = subtotal + cleaning_fee + service_fee + taxes

    return PriceBreakdown(
        nights=nights,
        nightly_rate=nightly_rate,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        taxes=taxes,
        total=total,
    )
