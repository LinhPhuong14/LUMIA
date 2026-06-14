import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export function MarketingShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div
      className="marketing-page page-scroll-area flex h-full min-h-0 flex-col"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
