import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Sidebar } from "@/components/dashboard/sidebar";
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

export function DashboardShell({
  sessionName,
  planLabel,
  title,
  subtitle,
  children,
  isAdmin,
}: {
  sessionName: string;
  planLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  isAdmin?: boolean;
}) {
  return (
    <div className="dashboard-shell-bg min-h-screen overflow-hidden pb-20 lg:pb-0">
      <div className="mx-auto flex max-w-[1640px] gap-4 px-4 py-4 lg:h-screen lg:px-5 lg:py-5">
        <Sidebar isAdmin={isAdmin} />

        <main className="min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col">
          <div className="dashboard-glass rounded-[32px] px-5 py-5 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[13px] capitalize text-muted">{formatFriendlyDate()}</div>
                <h1 className="mt-2 font-serif text-[2.1rem] leading-[0.98] tracking-[-0.04em] text-matcha-deep md:text-[2.55rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted">{subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="rounded-full border border-white/80 bg-white/72 px-3.5 py-2 text-[13px] font-medium text-matcha-deep">
                  {planLabel}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(145deg,#FFF3C7,#DDE8D2)] text-[13px] font-semibold text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]">
                  {getInitials(sessionName)}
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className={cn("mt-4 lg:min-h-0 lg:flex-1 lg:overflow-auto")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
