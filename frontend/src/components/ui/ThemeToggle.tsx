"use client";
import { useEffect, useState } from "react";

// Dark-mode toggle: flips the `dark` class on <html> and persists the choice.
// Initial theme is applied pre-hydration by the inline script in layout.tsx.
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-base hover:bg-bg-soft ${className}`}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
