"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Role } from "@/lib/types";

// Airbnb-style "Log in or sign up" modal (the design brief §5 auth). Email +
// password, with a guest/host choice on signup. Social buttons are decorative.
export default function AuthModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
}) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<"login" | "signup">(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("guest");
  const [busy, setBusy] = useState(false);

  // Sync the active tab whenever the modal is (re)opened in a given mode.
  useEffect(() => {
    if (open) setTab(mode);
  }, [open, mode]);

  const submit = async () => {
    try {
      setBusy(true);
      if (tab === "login") {
        await login(email, password);
        toast.success("Welcome back");
      } else {
        await signup(name, email, password, role);
        toast.success("Welcome to StayFinder");
      }
      onClose();
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-lg border border-line bg-bg p-3 text-sm outline-none focus:border-ink";

  return (
    <Modal open={open} onClose={onClose} title="Log in or sign up">
      <h2 className="mb-5 text-xl font-semibold">
        {tab === "login" ? "Welcome back" : "Welcome to StayFinder"}
      </h2>

      <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && submit()}>
        {tab === "signup" && (
          <input
            className={input}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className={input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={input}
          placeholder={tab === "signup" ? "Password (min 6 chars)" : "Password"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {tab === "signup" && (
          <select className={input} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="guest">I want to travel (guest)</option>
            <option value="host">I want to host</option>
          </select>
        )}
        <button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-lg bg-brand-gradient py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {busy ? "Please wait…" : tab === "login" ? "Log in" : "Sign up"}
        </button>
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line-soft" /> or <span className="h-px flex-1 bg-line-soft" />
      </div>
      <div className="space-y-2">
        <button
          onClick={() => toast.info("Coming soon")}
          className="w-full rounded-lg border border-line py-2.5 text-sm font-medium hover:bg-bg-soft"
        >
          Continue with Google
        </button>
        <button
          onClick={() => toast.info("Coming soon")}
          className="w-full rounded-lg border border-line py-2.5 text-sm font-medium hover:bg-bg-soft"
        >
          Continue with Apple
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {tab === "login" ? "New to StayFinder?" : "Already have an account?"}{" "}
        <button
          onClick={() => setTab(tab === "login" ? "signup" : "login")}
          className="font-medium text-ink underline"
        >
          {tab === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
      {tab === "login" && (
        <p className="mt-2 text-center text-xs text-muted">
          Demo: alice@example.com / password123 (host) · dave@example.com (guest)
        </p>
      )}
    </Modal>
  );
}
