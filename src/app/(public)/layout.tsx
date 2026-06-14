import type { ReactNode } from "react";

import { LandingShell } from "@/components/shell/landing-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <LandingShell>{children}</LandingShell>;
}
