"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export function FloatingStoreBubble() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/store") || pathname.startsWith("/store")) return null;

  return (
    <div className="fixed bottom-[calc(164px+env(safe-area-inset-bottom,0px))] right-4 z-40 lg:hidden">
      <Link
        href="/dashboard/store"
        aria-label="Cửa hàng"
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition active:scale-90"
      >
        <ShoppingBag className="h-[20px] w-[20px] text-[var(--foreground)]" />
      </Link>
    </div>
  );
}
