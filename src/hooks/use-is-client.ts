"use client";

import { useSyncExternalStore } from "react";

/** True only after hydration — avoids SSR/client branch mismatches. */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
