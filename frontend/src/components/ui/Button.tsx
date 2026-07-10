import type { ButtonHTMLAttributes } from "react";

// Buttons per the design brief §4: primary = brand-gradient; secondary = white + line
// border; ghost = text + underline on hover.
type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white hover:brightness-95 rounded-lg font-semibold",
  secondary:
    "bg-bg text-ink border border-line hover:bg-bg-soft rounded-lg font-semibold",
  ghost: "text-ink font-semibold underline-offset-2 hover:underline",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-3 text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50 disabled:pointer-events-none";
  return <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props} />;
}
