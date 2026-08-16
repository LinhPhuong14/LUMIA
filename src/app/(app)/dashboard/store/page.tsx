import type { Metadata } from "next";

import { UnifiedStore } from "@/components/store/unified-store";

export const metadata: Metadata = {
  title: "Cửa hàng | Lumia",
};

export default async function DashboardStorePage() {

  return (
  <UnifiedStore stickyTop="0px" hideRegisterCta />
  );
}
