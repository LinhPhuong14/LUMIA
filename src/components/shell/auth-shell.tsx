"use client";

import { useRef, useState, type ReactNode } from "react";

import { AuthMinimalHeader } from "@/components/auth/auth-minimal-header";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useMobileFormFocus } from "@/lib/use-mobile-form-focus";
import { cn } from "@/lib/utils";

export function AuthShell({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const [headerHidden, setHeaderHidden] = useState(false);

  useMobileFormFocus(mainRef, setHeaderHidden);

  return (
    <div
      className="auth-page min-h-dvh"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      {/* Theme toggle always visible, above everything */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <header
        className={cn(
          "auth-page-header shell shrink-0 transition-all duration-300 ease-out",
          "flex items-center justify-between py-4 pr-14",
          headerHidden && "max-lg:pointer-events-none max-lg:-translate-y-full max-lg:opacity-0 max-lg:h-0 max-lg:overflow-hidden max-lg:py-0",
        )}
      >
        <AuthMinimalHeader />
      </header>
      <main ref={mainRef} className="auth-page-main">
        <div className="shell flex w-full flex-col py-4 pb-[max(2.5rem,var(--safe-bottom))]">{children}</div>
      </main>
    </div>
  );
}
