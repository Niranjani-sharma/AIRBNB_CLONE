"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken, decodeUserFromToken } from "@/lib/auth";
import type { Role, User } from "@/lib/types";

// Session source of truth (the design brief §1/§8). Holds the current user + token and
// exposes login / signup / logout / switch-role. switch-role returns a NEW token
// which we must store.
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthed: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: () => Promise<User>;
}

const Ctx = createContext<AuthContextValue | null>(null);

// `initialUser` is decoded from the token cookie on the SERVER (root layout) and
// passed in, so the role is correct on the very first render — no guest→host flash
// and no hydration mismatch. It's a partial User (role/id/email); GET /users/me
// then enriches it with name/avatar.
export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/users/me");
      setUser(res.data as User);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Re-seed synchronously from the token in case the client cookie differs from
    // what SSR saw, then enrich with the full profile. The role is already correct
    // from `initialUser`, so this never flips the nav.
    const seeded = decodeUserFromToken(getToken());
    if (seeded) {
      setUser((prev) => (prev && prev.id === seeded.id ? prev : seeded));
      refresh();
    } else {
      setUser(null);
    }
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.token);
    setUser(res.data.user as User);
    return res.data.user as User;
  };

  const signup = async (name: string, email: string, password: string, role: Role) => {
    const res = await api.post("/auth/signup", { name, email, password, role });
    setToken(res.data.token);
    setUser(res.data.user as User);
    return res.data.user as User;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* stateless token; ignore */
    }
    clearToken();
    setUser(null);
  };

  const switchRole = async () => {
    const res = await api.post("/auth/switch-role");
    setToken(res.data.token); // fresh token — must replace
    setUser(res.data.user as User);
    return res.data.user as User;
  };

  return (
    <Ctx.Provider
      value={{ user, loading, isAuthed: !!user, refresh, login, signup, logout, switchRole }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
