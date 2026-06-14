"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { MarketingShell } from "@/components/shell/marketing-shell";

export function MarketingShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showFooter = !pathname.startsWith("/checkout");

  return <MarketingShell showFooter={showFooter}>{children}</MarketingShell>;
}
