"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buildPagePath, trackPageView } from "@/lib/analytics";

/**
 * GA được config với `send_page_view: false`, nên mỗi lần App Router đổi route
 * (kể cả điều hướng client-side) ta tự bắn `page_view` tại đây.
 */
export function GaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView(buildPagePath(pathname, searchParams));
  }, [pathname, searchParams]);

  return null;
}
