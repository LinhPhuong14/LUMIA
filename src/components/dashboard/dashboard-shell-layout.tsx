"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/shell/top-bar";
import { MobileAppHeader } from "@/components/mobile/mobile-app-header";
import { MobileMoreSheet } from "@/components/mobile/mobile-more-sheet";
import { MobileTabBar } from "@/components/mobile/mobile-tab-bar";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";
import { cn } from "@/lib/utils";

function DashboardShellInner({
  sessionName,
  sessionEmail,
  planLabel,
  badgeVariant,
  title,
  subtitle,
  children,
  isAdmin,
}: {
  sessionName: string;
  sessionEmail?: string;
  planLabel: string;
  badgeVariant: PlanBadgeVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isHub = pathname === "/dashboard";
  const isChat = pathname === "/ai" || pathname.startsWith("/ai/");
  const mobileTitle = isHub ? "Tối nay" : title;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMoreOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dashboard-shell lumia-aura-dashboard lumia-grain-soft relative h-dvh max-h-dvh overflow-hidden">
      <div className="dashboard-shell-grid dashboard-shell-unified">
        <Sidebar isAdmin={isAdmin} sessionName={sessionName} planLabel={planLabel} />

        <div className="dashboard-content-column max-lg:col-span-full max-lg:h-dvh">
          <div className="hidden lg:block">
            <TopBar
              title={title}
              subtitle={subtitle}
              planLabel={planLabel}
              badgeVariant={badgeVariant}
              sessionName={sessionName}
            />
          </div>

          <div className="lg:hidden">
            <MobileAppHeader
            title={mobileTitle}
            subtitle={isHub ? undefined : subtitle}
            planLabel={planLabel}
            badgeVariant={badgeVariant}
            sessionName={sessionName}
            variant={isHub ? "hub" : "default"}
            onMoreOpen={() => setMoreOpen(true)}
            />
          </div>

          <div
            className={cn(
              "dashboard-scroll-area lumia-scroll dashboard-page-root lg:pr-1",
              "max-lg:mobile-app-content max-lg:px-4 max-lg:pt-2",
              isChat && "dashboard-scroll-area--locked max-lg:overflow-hidden",
            )}
          >
            {children}
          </div>

          <div className="lg:hidden">
            <MobileTabBar />
          </div>
        </div>
      </div>

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        userName={sessionName}
        userEmail={sessionEmail}
      />
    </div>
  );
}

export function DashboardShellLayout(props: {
  sessionName: string;
  sessionEmail?: string;
  planLabel: string;
  badgeVariant: PlanBadgeVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
  isAdmin?: boolean;
}) {
  return <DashboardShellInner {...props} />;
}
