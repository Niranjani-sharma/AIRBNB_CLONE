"use client";
import { createContext, useContext } from "react";
import { Toaster, toast as hotToast } from "react-hot-toast";

// Toast context (the design brief §1). Dark pill, white text (§4). Mounts a single
// Toaster; existing react-hot-toast calls keep working, new code uses useToast().
interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const Ctx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value: ToastContextValue = {
    success: (m) => hotToast.success(m),
    error: (m) => hotToast.error(m),
    info: (m) => hotToast(m),
  };
  return (
    <Ctx.Provider value={value}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#222222",
            color: "#ffffff",
            borderRadius: "9999px",
            fontSize: "14px",
            padding: "10px 18px",
            maxWidth: "90vw",
          },
        }}
      />
      {children}
    </Ctx.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
