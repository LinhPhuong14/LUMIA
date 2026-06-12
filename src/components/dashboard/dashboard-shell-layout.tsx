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

export function DashboardShellLayout({
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
      <div className="dashboard-glow dashboard-glow--mint" aria-hidden />
      <div className="dashboard-glow dashboard-glow--lime" aria-hidden />
      <div className="dashboard-glow dashboard-glow--honey" aria-hidden />

      <div className="dashboard-shell-grid hidden md:grid">
        <Sidebar isAdmin={isAdmin} sessionName={sessionName} planLabel={planLabel} />

        <div className="dashboard-content-column">
          <TopBar
            title={title}
            subtitle={subtitle}
            planLabel={planLabel}
            badgeVariant={badgeVariant}
            sessionName={sessionName}
          />
          <div
            className={cn(
              "dashboard-scroll-area lumia-scroll dashboard-page-root pr-1",
              isChat && "dashboard-scroll-area--locked",
            )}
          >
            {children}
          </div>
        </div>
      </div>

      <div className="mobile-app-shell md:hidden">
        <MobileAppHeader
          title={mobileTitle}
          subtitle={isHub ? undefined : subtitle}
          planLabel={planLabel}
          badgeVariant={badgeVariant}
          sessionName={sessionName}
          variant={isHub ? "hub" : "default"}
          onMoreOpen={() => setMoreOpen(true)}
        />
        <main
          className={cn(
            "mobile-app-content lumia-scroll dashboard-page-root px-4 pt-2",
            isChat && "overflow-hidden",
          )}
        >
          {children}
        </main>
        <MobileTabBar />
        <MobileMoreSheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          userName={sessionName}
          userEmail={sessionEmail}
        />
      </div>
    </div>
  );
}
