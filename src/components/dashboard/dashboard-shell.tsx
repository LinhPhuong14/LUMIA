import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenText, Gift, Home, MessageCircleHeart, Settings2, Ticket } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { LumiaLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/journal?mode=release", label: "Viết ra", icon: BookOpenText },
  { href: "/ai", label: "LUMIA lắng nghe", icon: MessageCircleHeart },
  { href: "/dashboard/boxes", label: "Hộp dành cho bạn", icon: Gift },
  { href: "/subscription", label: "Gói của tôi", icon: Ticket },
  { href: "/settings", label: "Cài đặt", icon: Settings2 },
] as const;

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
  currentPath,
  sessionName,
  planLabel,
  title,
  subtitle,
  children,
}: {
  currentPath: string;
  sessionName: string;
  planLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell-bg min-h-screen overflow-hidden">
      <div className="mx-auto flex max-w-[1560px] gap-3 px-3 py-3 lg:h-screen lg:px-4 lg:py-4">
        <aside className="dashboard-glass sticky top-4 hidden h-[calc(100vh-2rem)] w-[228px] shrink-0 flex-col rounded-[30px] px-4 py-4 lg:flex">
          <LumiaLogo />

          <nav className="mt-6 flex flex-1 flex-col gap-1.5">
            {navigation.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[22px] px-3.5 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,253,245,0.88),rgba(255,243,199,0.48))] text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]"
                      : "text-muted hover:bg-white/62 hover:text-matcha-deep",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="dashboard-glass rounded-[24px] p-4 text-sm leading-6 text-muted">
            <div className="font-medium text-matcha-deep">Nhẹ đi một chút cũng đã là bắt đầu.</div>
            <p className="mt-2">
              Không gian này ưu tiên những bước thật nhỏ, đủ để bạn quay lại với mình mà không bị áp lực.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col">
          <div className="dashboard-glass rounded-[30px] px-4 py-4 lg:px-5 lg:py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm capitalize text-muted">{formatFriendlyDate()}</div>
                <h1 className="mt-2 font-serif text-[2.35rem] leading-[0.96] tracking-[-0.04em] text-matcha-deep md:text-[2.85rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="rounded-full border border-white/80 bg-white/72 px-3.5 py-2 text-sm font-medium text-matcha-deep">
                  {planLabel}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(145deg,#FFF3C7,#DDE8D2)] text-sm font-semibold text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]">
                  {getInitials(sessionName)}
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className="mt-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
