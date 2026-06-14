import type { ReactNode } from "react";

import { AuthMinimalHeader } from "@/components/auth/auth-minimal-header";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="page-scroll-area flex h-full min-h-0 flex-col"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      <div className="shell flex items-center justify-between py-4">
        <AuthMinimalHeader />
        <ThemeToggle />
      </div>
      <main className="shell flex flex-1 items-center pb-10">{children}</main>
    </div>
  );
}
