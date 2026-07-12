"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ShoppingBag, ChevronRight, Sparkles } from "lucide-react";

import { getAllPurchasableProducts } from "@/data/catalog";
import { Panel } from "@/components/dashboard/shell/panel";

type PlanLite = { id: string; name?: string | null; price_vnd?: number | null; is_featured?: boolean | null };

export function StoreWidget() {
  const [dbPlans, setDbPlans] = useState<Record<string, PlanLite>>({});

  useEffect(() => {
    fetch("/api/store/plans")
      .then((r) => r.json())
      .then((data: PlanLite[]) => {
        const map: Record<string, PlanLite> = {};
        (Array.isArray(data) ? data : []).forEach((p) => { if (p.id) map[p.id] = p; });
        setDbPlans(map);
      })
      .catch(() => {});
  }, []);

  // Overlay admin-managed price/name from the DB onto the static plans.
  const allPlans = getAllPurchasableProducts().map((b) => {
    const p = dbPlans[b.tier];
    return p
      ? { ...b, name: p.name ?? b.name, price: typeof p.price_vnd === "number" ? p.price_vnd : b.price, featured: p.is_featured ?? b.featured }
      : b;
  });
  const promoBox = allPlans.find((b) => b.group === "promo");
  const digitalPlans = allPlans.filter((b) => b.group === "digital").slice(0, 2);
  const boxes = [...(promoBox ? [promoBox] : []), ...digitalPlans].slice(0, 3);

  return (
    <Panel pad="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--green)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">
            Cửa hàng
          </span>
        </div>
        <Link
          href="/store"
          className="flex items-center gap-1 text-[12px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Xem tất cả
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {boxes.map((box) => (
          <Link
            key={box.slug}
            href={`/boxes/${box.slug}` as Route}
            className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--green)]/40 hover:bg-[var(--surface-card)]"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                {box.name}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]">{box.tagline}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-bold text-[var(--foreground)]">
                {box.price.toLocaleString("vi-VN")} ₫
              </p>
              {box.featured ? (
                <span className="mt-0.5 inline-block rounded-full bg-[var(--green-wash)] px-2 py-0.5 text-[10px] font-semibold text-[var(--green-deep)]">
                  Phổ biến
                </span>
              ) : box.group === "promo" ? (
                <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Ưu đãi mới
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/store"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-2.5 text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--foreground)]"
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Khám phá cửa hàng
      </Link>
    </Panel>
  );
}
