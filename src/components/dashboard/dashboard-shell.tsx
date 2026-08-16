import type { ReactNode } from "react";

import { DashboardShellLayout } from "@/components/dashboard/dashboard-shell-layout";
import { SubscriptionProvider } from "@/components/dashboard/subscription-context";
import { getPlanBadgeVariant, getPlanDisplayLabel } from "@/lib/subscription-labels";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";

export function DashboardShell({
  sessionName,
  sessionEmail,
  planLabel,
  subscription,
  children,
  isAdmin,
}: {
  sessionName: string;
  sessionEmail?: string;
  planLabel?: string;
  subscription?: SubscriptionSnapshot;
  children: ReactNode;
  isAdmin?: boolean;
}) {
  const resolvedPlanLabel =
    planLabel ?? (subscription ? getPlanDisplayLabel(subscription) : "Dùng thử");
  const badgeVariant = subscription ? getPlanBadgeVariant(subscription) : "free";
  const isPremium = badgeVariant === "active";

  return (
    <DashboardShellLayout
      sessionName={sessionName}
      sessionEmail={sessionEmail}
      planLabel={resolvedPlanLabel}
      badgeVariant={badgeVariant}
      isAdmin={isAdmin}
      isPremium={isPremium}
    >
      <SubscriptionProvider isActive={isPremium}>{children}</SubscriptionProvider>
    </DashboardShellLayout>
  );
}
