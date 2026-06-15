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
      className="auth-page flex min-h-dvh flex-col"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      <header
        className={cn(
          "auth-page-header shell shrink-0 transition-all duration-300 ease-out",
          "flex items-center justify-between py-4",
          headerHidden && "max-lg:pointer-events-none max-lg:-translate-y-full max-lg:opacity-0 max-lg:h-0 max-lg:overflow-hidden max-lg:py-0",
        )}
      >
        <AuthMinimalHeader />
        <ThemeToggle />
      </header>
      <main ref={mainRef} className="auth-page-main flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="shell flex w-full flex-1 flex-col py-4 pb-[max(2.5rem,var(--safe-bottom))]">{children}</div>
      </main>
    </div>
  );
}
