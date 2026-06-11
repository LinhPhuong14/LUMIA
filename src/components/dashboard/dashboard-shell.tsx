import type { ReactNode } from "react";

import { DashboardShellLayout } from "@/components/dashboard/dashboard-shell-layout";
import { getPlanBadgeVariant, getPlanDisplayLabel } from "@/lib/subscription-labels";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";

export function DashboardShell({
  sessionName,
  sessionEmail,
  planLabel,
  subscription,
  title,
  subtitle,
  children,
  isAdmin,
}: {
  sessionName: string;
  sessionEmail?: string;
  planLabel?: string;
  subscription?: SubscriptionSnapshot;
  title: string;
  subtitle: string;
  children: ReactNode;
  isAdmin?: boolean;
}) {
  const resolvedPlanLabel =
    planLabel ?? (subscription ? getPlanDisplayLabel(subscription) : "Dùng thử");
  const badgeVariant = subscription ? getPlanBadgeVariant(subscription) : "free";

  return (
    <DashboardShellLayout
      sessionName={sessionName}
      sessionEmail={sessionEmail}
      planLabel={resolvedPlanLabel}
      badgeVariant={badgeVariant}
      title={title}
      subtitle={subtitle}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShellLayout>
  );
}
