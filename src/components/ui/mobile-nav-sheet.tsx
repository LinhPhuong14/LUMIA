"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function MobileNavSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Đóng menu"
        className="mobile-nav-sheet-backdrop"
        onClick={onClose}
      />
      <div
        className={cn("mobile-nav-sheet", className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mobile-nav-sheet-handle" aria-hidden />
        <div className="mobile-nav-sheet-header">
          <span className="font-serif text-xl text-[var(--matcha-deep)]">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="touch-target flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mobile-nav-sheet-body lumia-scroll">{children}</div>
        {footer ? <div className="mobile-nav-sheet-footer shrink-0">{footer}</div> : null}
      </div>
    </>
  );
}
