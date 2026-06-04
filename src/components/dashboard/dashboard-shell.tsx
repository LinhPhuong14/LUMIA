import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenText, Home, MessageCircleHeart, Settings2, Ticket } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { LumiaLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/journal?mode=release", label: "Viết ra", icon: BookOpenText },
  { href: "/ai", label: "LUMIA lắng nghe", icon: MessageCircleHeart },
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#FFFEFA_0%,#FFFDF5_35%,#DDE8D2_70%,#FFF3C7_100%)]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 lg:px-6">
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[248px] shrink-0 flex-col rounded-[34px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.16)] backdrop-blur lg:flex">
          <LumiaLogo />
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {navigation.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] text-matcha-deep shadow-[0_18px_40px_rgba(244,216,120,0.14)]"
                      : "text-muted hover:bg-white/82 hover:text-matcha-deep",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 text-sm leading-6 text-muted">
            <div className="font-medium text-matcha-deep">Workspace trước, áp lực sau.</div>
            <p className="mt-2">LUMIA không yêu cầu bạn phải làm nhiều. Chỉ cần quay lại và bắt đầu từ điều nhỏ nhất.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(143,168,120,0.12)] backdrop-blur">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm capitalize text-muted">{formatFriendlyDate()}</div>
                <h1 className="mt-3 font-serif text-5xl leading-tight text-matcha-deep md:text-6xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted md:text-lg">{subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-matcha-soft bg-[#FFFEFA] px-4 py-2 text-sm font-medium text-matcha-deep">
                  {planLabel}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(145deg,#FFF3C7,#DDE8D2)] text-sm font-semibold text-matcha-deep">
                  {getInitials(sessionName)}
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
