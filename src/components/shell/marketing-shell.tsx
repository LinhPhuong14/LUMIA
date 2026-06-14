import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingFooterGate } from "@/components/shell/marketing-footer-gate";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="marketing-page page-scroll-area flex h-full min-h-0 flex-col"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooterGate>
        <SiteFooter />
      </MarketingFooterGate>
    </div>
  );
}
