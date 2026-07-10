"use client";
import { createContext, useCallback, useContext, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

// Lets any component open the auth modal (e.g. the navbar or a "Log in to book"
// prompt) without prop-drilling.
type Mode = "login" | "signup";
interface AuthModalContextValue {
  open: (mode?: Mode) => void;
  close: () => void;
}

const Ctx = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; mode: Mode }>({ open: false, mode: "login" });
  const open = useCallback((mode: Mode = "login") => setState({ open: true, mode }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      <AuthModal open={state.open} mode={state.mode} onClose={close} />
    </Ctx.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
  return ctx;
}
