"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MarketingFooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return null;
  return children;
}
