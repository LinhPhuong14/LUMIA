import type { ReactNode } from "react";

import { MarketingShellLayout } from "@/components/shell/marketing-shell-layout";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShellLayout>{children}</MarketingShellLayout>;
}
