"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { api } from "@/lib/api";
import type { Availability, BookedRange } from "@/lib/types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

// Shared reservation state for a listing detail page: the inline calendar (left
// column) and the sticky reservation card read/write the same {checkIn, checkOut,
// focus, guests}. Booked/past days come from /availability.
interface ReservationValue {
  checkIn: string;
  checkOut: string;
  focus: "checkIn" | "checkOut";
  setFocus: (f: "checkIn" | "checkOut") => void;
  guests: number;
  setGuests: (n: number) => void;
  maxGuests: number;
  isDisabled: (d: Date) => boolean;
  inRange: (d: Date) => boolean;
  selectDay: (d: Date) => void;
  clearDates: () => void;
  nights: number;
}

const Ctx = createContext<ReservationValue | null>(null);

export function ReservationProvider({
  listingId,
  maxGuests,
  children,
}: {
  listingId: number;
  maxGuests: number;
  children: React.ReactNode;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [focus, setFocus] = useState<"checkIn" | "checkOut">("checkIn");
  const [guests, setGuests] = useState(1);
  const [booked, setBooked] = useState<BookedRange[]>([]);

  useEffect(() => {
    api
      .get(`/listings/${listingId}/availability`)
      .then((r) => setBooked((r.data as Availability).booked ?? []))
      .catch(() => setBooked([]));
  }, [listingId]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const blocked = useMemo(() => {
    const s = new Set<string>();
    for (const r of booked) {
      const start = parseISO(r.checkIn);
      const lastNight = addDays(parseISO(r.checkOut), -1);
      if (isBefore(lastNight, start)) continue;
      for (const d of eachDayOfInterval({ start, end: lastNight })) s.add(iso(d));
    }
    return s;
  }, [booked]);

  const isDisabled = useCallback(
    (d: Date) => isBefore(d, today) || blocked.has(iso(d)),
    [today, blocked]
  );

  const inRange = useCallback(
    (d: Date) => Boolean(checkIn && checkOut && iso(d) >= checkIn && iso(d) <= checkOut),
    [checkIn, checkOut]
  );

  const selectDay = useCallback(
    (d: Date) => {
      if (isBefore(d, today) || blocked.has(iso(d))) return;
      const s = iso(d);
      const startFresh = () => {
        setCheckIn(s);
        setCheckOut("");
        setFocus("checkOut");
      };
      if (focus === "checkIn" || !checkIn || (checkIn && checkOut)) return startFresh();
      const ci = parseISO(checkIn);
      if (!isAfter(d, ci)) return startFresh();
      // Reject a range that would span a booked night.
      const nights = eachDayOfInterval({ start: ci, end: addDays(d, -1) });
      if (nights.some((n) => blocked.has(iso(n)))) return startFresh();
      setCheckOut(s);
      setFocus("checkIn");
    },
    [today, blocked, focus, checkIn, checkOut]
  );

  const clearDates = useCallback(() => {
    setCheckIn("");
    setCheckOut("");
    setFocus("checkIn");
  }, []);

  const nights =
    checkIn && checkOut
      ? Math.round((parseISO(checkOut).getTime() - parseISO(checkIn).getTime()) / 86400000)
      : 0;

  return (
    <Ctx.Provider
      value={{
        checkIn,
        checkOut,
        focus,
        setFocus,
        guests,
        setGuests,
        maxGuests,
        isDisabled,
        inRange,
        selectDay,
        clearDates,
        nights,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useReservation(): ReservationValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReservation must be used within a ReservationProvider");
  return ctx;
}
