"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { resolvePageMeta } from "@/lib/dashboard-page-meta";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/shell/top-bar";
import { MobileAppHeader } from "@/components/mobile/mobile-app-header";
import { FloatingChatBubble } from "@/components/mobile/floating-chat-bubble";
import { FloatingStoreBubble } from "@/components/mobile/floating-store-bubble";
import { MobileMoreSheet } from "@/components/mobile/mobile-more-sheet";
import { MobileTabBar } from "@/components/mobile/mobile-tab-bar";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";
import { cn } from "@/lib/utils";

function DashboardShellInner({
  sessionName,
  sessionEmail,
  planLabel,
  badgeVariant,
  children,
  isAdmin,
  isPremium,
}: {
  sessionName: string;
  sessionEmail?: string;
  planLabel: string;
  badgeVariant: PlanBadgeVariant;
  children: ReactNode;
  isAdmin?: boolean;
  isPremium?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Khung nằm ở layout nên không nhận được prop từ trang nữa — tra theo đường dẫn.
  const { title, subtitle } = resolvePageMeta(pathname, sessionName);
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
            isPremium={isPremium}
            />
          </div>

          <div
            className={cn(
              "dashboard-scroll-area lumia-scroll dashboard-page-root lg:pr-1",
              // `mobile-app-content` là class CSS tự viết, KHÔNG phải utility của
              // Tailwind — viết `max-lg:mobile-app-content` thì Tailwind không
              // sinh ra rule nào cả, class rơi vào hư không và khoảng trống chừa
              // cho thanh tab dưới cùng chưa bao giờ được áp. Giới hạn theo màn
              // hình nằm trong chính file CSS (@media max-width: 1023px).
              "mobile-app-content max-lg:px-4 max-lg:pt-2",
              isChat && "dashboard-scroll-area--locked max-lg:overflow-hidden",
            )}
          >
            {children}
          </div>

          <div className="lg:hidden">
            <MobileTabBar onMoreOpen={() => setMoreOpen(true)} />
          </div>
        </div>
      </div>

      <FloatingChatBubble />
      <FloatingStoreBubble />

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
  children: ReactNode;
  isAdmin?: boolean;
  isPremium?: boolean;
}) {
  return <DashboardShellInner {...props} />;
}
