import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnifiedStore } from "@/components/store/unified-store";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Cửa hàng | Lumia",
};

export default async function DashboardStorePage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Cửa hàng"
      subtitle="Gói thành viên & sản phẩm wellbeing"
      isAdmin={session.role === "admin"}
    >
      <UnifiedStore stickyTop="0px" hideRegisterCta />
    </DashboardShell>
  );
}
