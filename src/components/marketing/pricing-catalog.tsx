"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { ProductCard } from "@/components/marketing/product-card";
import type { BoxProduct } from "@/data/catalog";
import { digitalPackages, freeTierInfo, hybridPackages, promoBox, storeItems } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

type Tab = "digital" | "hybrid" | "store";

export function PricingCatalog({
  firstTimeUnavailable = false,
}: {
  firstTimeUnavailable?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("digital");

  const tabs: { id: Tab; label: string; subtitle: string }[] = [
    { id: "digital", label: "Gói Nền tảng Số", subtitle: "Digital Only - 100% trải nghiệm trên app" },
    { id: "hybrid", label: "Gói Hệ sinh thái", subtitle: "Hybrid - App Premium + đặc quyền vật lý" },
    { id: "store", label: "LUMIA Store", subtitle: "Công cụ hỗ trợ trong hệ sinh thái" },
  ];

  const activePackages: BoxProduct[] = tab === "digital" ? digitalPackages : hybridPackages;

  return (
    <div>
      {/* Promo banner - not in fixed menu */}
      <section className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-[var(--lumia-green-soft)] bg-gradient-to-r from-[var(--lumia-green-bg)] to-white p-6 shadow-[0_8px_32px_rgba(45,58,40,0.08)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--lumia-green)]">
              Ưu đãi người dùng mới
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[var(--title-primary)] md:text-3xl">
              Bắt đầu ngay chỉ với {formatCurrency(promoBox.price)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--lumia-text-mid)]">
              App Premium 1 tháng + Welcome Kit (trà thảo mộc & xịt gối mini) - dành riêng lần đầu.
            </p>
          </div>
          {firstTimeUnavailable ? (
            <span className="rounded-full border border-[var(--lumia-green-soft)] px-5 py-3 text-sm text-[var(--lumia-text-soft)]">
              Bạn đã sử dụng ưu đãi này
            </span>
          ) : (
            <Link href={`/boxes/${promoBox.slug}`} className="button-primary shrink-0 px-8 py-4 text-[13px]">
              Nhận ưu đãi 99k
            </Link>
          )}
        </div>
      </section>

      {/* Free tier */}
      <section className="mx-auto mt-8 max-w-4xl rounded-[24px] border border-[var(--lumia-green-soft)] bg-surface-card p-5 shadow-[0_4px_20px_rgba(45,58,40,0.06)] md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--title-primary)]">{freeTierInfo.name}</h3>
            <p className="mt-1 text-sm text-[var(--lumia-text-mid)]">Miễn phí - {freeTierInfo.features.join(" · ")}</p>
          </div>
          <Link href={freeTierInfo.ctaHref as Route} className="button-secondary shrink-0 text-[13px]">
            {freeTierInfo.ctaLabel}
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-3 sm:flex-row">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-[20px] border px-5 py-4 text-left transition ${
              tab === t.id
                ? "border-[var(--lumia-green)] bg-[var(--lumia-green-bg)] shadow-[0_4px_16px_rgba(45,58,40,0.08)]"
                : "border-[var(--lumia-green-soft)] bg-surface-card hover:bg-[var(--lumia-green-bg)]/50"
            }`}
          >
            <div className="text-sm font-bold text-[var(--title-primary)]">{t.label}</div>
            <div className="mt-1 text-xs text-[var(--lumia-text-soft)]">{t.subtitle}</div>
          </button>
        ))}
      </div>

      {tab === "store" ? (
        <section className="mx-auto mt-8 max-w-4xl">
          <p className="mb-6 text-center text-sm leading-7 text-[var(--lumia-text-mid)]">
            Đây là các công cụ hỗ trợ trong hệ sinh thái LUMIA - được tặng kèm hoặc mua riêng khi bạn
            chọn gói cao cấp.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {storeItems.map((item) => (
              <article
                key={item.name}
                className="rounded-[24px] border border-[var(--lumia-green-soft)] bg-surface-card p-5 shadow-[0_4px_20px_rgba(45,58,40,0.06)]"
              >
                <h3 className="font-semibold text-[var(--title-primary)]">{item.name}</h3>
                <p className="mt-2 text-sm text-[var(--lumia-text-mid)]">{item.description}</p>
                <p className="mt-3 text-xs text-[var(--lumia-green)]">{item.note}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[var(--lumia-text-soft)]">
            Muốn nhận bộ đầy đủ? Xem{" "}
            <button type="button" onClick={() => setTab("hybrid")} className="font-semibold text-[var(--lumia-green)] underline">
              Gói Hệ sinh thái
            </button>
          </p>
        </section>
      ) : (
        <section className="products-grid mx-auto mt-8 md:mt-10">
          {activePackages.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
