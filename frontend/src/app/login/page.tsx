"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login(creds.email, creds.password);
      toast.success("Welcome back");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-3">
      <h1 className="text-2xl font-semibold">{loading ? "Logging in…" : "Log in"}</h1>
      <input
        className="rounded-lg border border-line p-3"
        placeholder="Email"
        value={creds.email}
        onChange={(e) => setCreds({ ...creds, email: e.target.value })}
      />
      <input
        className="rounded-lg border border-line p-3"
        placeholder="Password"
        type="password"
        value={creds.password}
        onChange={(e) => setCreds({ ...creds, password: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onLogin()}
      />
      <button
        onClick={onLogin}
        className="rounded-lg bg-brand-gradient p-3 font-semibold text-white transition hover:brightness-95"
      >
        Log in
      </button>
      <p className="text-center text-xs text-muted">
        Try alice@example.com / password123 (host) or dave@example.com (guest)
      </p>
      <Link href="/signup" className="text-center text-sm text-muted underline">
        Create an account
      </Link>
    </div>
  );
}
