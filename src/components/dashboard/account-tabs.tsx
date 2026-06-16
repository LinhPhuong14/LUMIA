"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "account", label: "Tài khoản", href: "/account" },
  { id: "settings", label: "Cài đặt", href: "/account?tab=settings" },
  { id: "feedback", label: "Góp ý", href: "/account?tab=feedback" },
] as const;

export function AccountTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="mb-6 flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "flex-1 rounded-[10px] py-2 text-center text-[13px] font-medium transition",
            activeTab === tab.id
              ? "bg-[var(--green)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
