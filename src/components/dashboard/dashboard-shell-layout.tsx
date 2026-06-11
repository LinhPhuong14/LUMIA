"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { MobileAppHeader } from "@/components/mobile/mobile-app-header";
import { MobileMoreSheet } from "@/components/mobile/mobile-more-sheet";
import { MobileTabBar } from "@/components/mobile/mobile-tab-bar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PlanBadge } from "@/components/ui/plan-badge";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";
import { cn } from "@/lib/utils";

function formatFriendlyDate() {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMoreOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dashboard-shell-bg min-h-[100dvh] lg:min-h-screen lg:overflow-hidden lg:pb-0">
      <div className="mx-auto hidden max-w-[1640px] gap-4 px-5 py-5 lg:flex lg:h-screen">
        <Sidebar isAdmin={isAdmin} />

        <main className="min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col">
          <div className="dashboard-glass rounded-[32px] border-matcha-soft/40 px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[13px] capitalize text-muted">{formatFriendlyDate()}</div>
                <h1 className="mt-2 font-serif text-[2.55rem] leading-[0.98] tracking-[-0.04em] text-matcha-deep">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted">{subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <PlanBadge label={planLabel} variant={badgeVariant} />
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--champagne),var(--matcha-soft))] text-[13px] font-semibold text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]"
                  title={sessionEmail}
                >
                  {getInitials(sessionName)}
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className={cn("mt-4 lg:min-h-0 lg:flex-1 lg:overflow-auto")}>{children}</div>
        </main>
      </div>

      <div className="mobile-app-shell flex min-h-[100dvh] flex-col lg:hidden">
        <MobileAppHeader
          title={title}
          subtitle={subtitle}
          planLabel={planLabel}
          badgeVariant={badgeVariant}
          sessionName={sessionName}
        />
        <main className="mobile-app-content flex-1 px-4 pt-3">{children}</main>
        <MobileTabBar onMoreOpen={() => setMoreOpen(true)} />
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
