"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: Role }>({
    name: "",
    email: "",
    password: "",
    role: "guest",
  });
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      await signup(form.name, form.email, form.password, form.role);
      toast.success("Welcome to StayFinder");
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
      <h1 className="text-2xl font-semibold">{loading ? "Creating…" : "Sign up"}</h1>
      <input
        className="rounded-lg border border-line p-3"
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="rounded-lg border border-line p-3"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="rounded-lg border border-line p-3"
        placeholder="Password (min 6 chars)"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <select
        className="rounded-lg border border-line p-3"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
      >
        <option value="guest">I want to travel (guest)</option>
        <option value="host">I want to host</option>
      </select>
      <button
        onClick={onSignup}
        className="rounded-lg bg-brand-gradient p-3 font-semibold text-white transition hover:brightness-95"
      >
        Sign up
      </button>
      <Link href="/login" className="text-center text-sm text-muted underline">
        Already have an account? Log in
      </Link>
    </div>
  );
}
