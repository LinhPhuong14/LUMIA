import type { ReactNode } from "react";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="landing-page lumia-grain-soft page-scroll-area h-full"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      {children}
    </div>
  );
}
