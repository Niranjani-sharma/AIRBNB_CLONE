"use client";
import { useEffect, useRef } from "react";

// Accessible modal per the design brief §4/§8: centered rounded-2xl card, overlay scrim,
// close on Esc / scrim click, focus trap, focus restored on close.
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-[570px]",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const nodes = ref.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // focus first focusable
    requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLElement>("input,button,a[href]")?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`pop max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-bg shadow-[0_10px_40px_rgba(0,0,0,0.25)]`}
      >
        <div className="relative flex items-center justify-center border-b border-line-soft p-4">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none hover:bg-bg-soft"
          >
            ✕
          </button>
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
