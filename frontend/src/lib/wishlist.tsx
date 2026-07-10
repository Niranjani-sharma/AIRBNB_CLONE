"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { WishlistItemDTO } from "@/lib/types";

// App-wide wishlist state so a card's heart reflects the user's saved listings
// on every page (not just after a manual click). Loaded once from the API.
interface WishlistCtx {
  isSaved: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/wishlist")
      .then((r) => setSaved(new Set((r.data as WishlistItemDTO[]).map((w) => w.listing.id))))
      .catch(() => {
        /* not logged in / no wishlist */
      });
  }, []);

  const toggle = useCallback(
    async (id: number) => {
      if (!getToken()) {
        toast.error("Log in to save listings");
        return;
      }
      const has = saved.has(id);
      try {
        if (has) {
          await api.delete(`/wishlist/${id}`);
          setSaved((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        } else {
          await api.post("/wishlist", { listingId: id });
          setSaved((s) => new Set(s).add(id));
          toast.success("Saved to wishlist");
        }
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [saved]
  );

  return (
    <Ctx.Provider value={{ isSaved: (id) => saved.has(id), toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist(): WishlistCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
