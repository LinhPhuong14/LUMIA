"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, Package, Sparkles, ChevronRight } from "lucide-react";
import type { Route } from "next";

import { getAllPurchasableProducts, type BoxProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price_vnd: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  features?: string[] | null;
};

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "scent", label: "Nến thơm" },
  { id: "drink", label: "Trà & thức uống" },
  { id: "sleep", label: "Ngủ ngon" },
  { id: "meditation", label: "Thiền định" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  scent: "🕯️",
  drink: "🍵",
  sleep: "🌙",
  meditation: "✨",
  all: "🌿",
};

const TIER_EMOJI: Record<string, string> = {
  first_time: "🎁",
  standard: "📱",
  plus: "⭐",
  pro: "💎",
  premium: "🌸",
  ultimate: "🏆",
};

function SubscriptionCard({ box }: { box: BoxProduct }) {
  const isFeatured = box.featured;
  const isHybrid = box.group === "hybrid";
  const isPromo = box.group === "promo";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col overflow-hidden rounded-[24px] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(95,111,82,0.14)] ${
        isFeatured
          ? "border-[var(--green)] shadow-[0_8px_32px_rgba(95,111,82,0.18)]"
          : "border-[var(--border)] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      }`}
    >
      {isFeatured ? (
        <div className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
          Phổ biến nhất
        </div>
      ) : isPromo ? (
        <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
          Ưu đãi
        </div>
      ) : null}

      {/* Card header */}
      <div
        className="p-6 pb-5"
        style={{ background: box.gradient }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{TIER_EMOJI[box.tier] ?? "🌿"}</span>
          {isHybrid ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
              <Package className="h-2.5 w-2.5" />
              Kèm hộp quà
            </span>
          ) : null}
        </div>
        <h3 className="font-serif text-[20px] font-medium leading-tight text-[var(--green-deep)]">
          {box.name}
        </h3>
        <p className="mt-1 text-[12px] text-[var(--muted)]">{box.tagline}</p>
        <div className="mt-4">
          <span className="font-sans text-[28px] font-bold text-[var(--foreground)]">
            {formatVnd(box.price)}
          </span>
          {box.priceNote ? (
            <span className="ml-2 text-[12px] text-[var(--muted)]">{box.priceNote}</span>
          ) : null}
        </div>
        {box.savingsNote ? (
          <span className="mt-1 inline-block rounded-full bg-[var(--green-wash)] px-2 py-0.5 text-[11px] font-semibold text-[var(--green-deep)]">
            {box.savingsNote}
          </span>
        ) : null}
      </div>

      {/* Features */}
      <div className="flex flex-1 flex-col bg-[var(--surface-card)] p-5">
        <ul className="flex-1 space-y-2.5">
          {box.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--foreground)]">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
              {f}
            </li>
          ))}
          {box.physicalItems.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-[var(--foreground)]">
              <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              {item}
            </li>
          ))}
        </ul>

        <Link
          href={`/boxes/${box.slug}` as Route}
          className={`mt-5 flex items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-semibold transition hover:opacity-90 ${
            isFeatured
              ? "bg-[var(--green)] text-white"
              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--green)]/50"
          }`}
        >
          {box.ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price_vnd: product.price_vnd,
      image_url: product.image_url,
      variant: null,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(95,111,82,0.12)]">
      {/* Image */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--green-wash)] to-[var(--surface)]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl opacity-40">
            {CATEGORY_EMOJI[product.category] ?? "🌿"}
          </span>
        )}
        {!product.in_stock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
              Hết hàng
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="font-serif text-[16px] font-medium leading-snug text-[var(--foreground)]">
            {product.name}
          </h3>
          {product.subtitle ? (
            <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{product.subtitle}</p>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-sans text-[15px] font-bold text-[var(--foreground)]">
            {formatVnd(product.price_vnd)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.in_stock || added}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              added
                ? "bg-[var(--green-wash)] text-[var(--green-deep)]"
                : "bg-[var(--green)] text-white hover:opacity-90"
            }`}
          >
            {added ? (
              <>
                <Check className="h-3 w-3" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingBag className="h-3 w-3" />
                Thêm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnifiedStore() {
  const [subscriptionTab, setSubscriptionTab] = useState<"digital" | "hybrid">("digital");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const allBoxes = getAllPurchasableProducts();
  const promoBoxes = allBoxes.filter((b) => b.group === "promo");
  const filteredBoxes = allBoxes.filter(
    (b) => b.group === subscriptionTab || (subscriptionTab === "digital" && b.group === "promo"),
  );

  useEffect(() => {
    setLoadingProducts(true);
    const url = category === "all" ? "/api/store/products" : `/api/store/products?category=${category}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [category]);

  return (
    <div className="space-y-20 pb-20">
      {/* ── Section 1: Subscription plans ── */}
      <section id="goi-hanh-trinh">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--green)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">Hành trình</span>
            </div>
            <h2 className="mt-1 font-serif text-[28px] font-medium leading-tight text-[var(--foreground)] sm:text-[32px]">
              Gói LUMIA cho bạn
            </h2>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
              Truy cập toàn bộ tính năng premium. Một số gói kèm hộp quà wellbeing giao tận nhà.
            </p>
          </div>

          {/* Digital / Hybrid toggle */}
          <div className="flex shrink-0 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
            {(["digital", "hybrid"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSubscriptionTab(t)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                  subscriptionTab === t
                    ? "bg-[var(--surface-card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)]"
                }`}
              >
                {t === "digital" ? "📱 Chỉ app" : "📦 Kèm hộp quà"}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={subscriptionTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredBoxes.map((box) => (
              <SubscriptionCard key={box.slug} box={box} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Section 2: Physical products ── */}
      <section id="san-pham">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">Sản phẩm</span>
          </div>
          <h2 className="mt-1 font-serif text-[28px] font-medium leading-tight text-[var(--foreground)] sm:text-[32px]">
            Wellbeing store
          </h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
            Sản phẩm chọn lọc để tạo không gian ngủ và thư giãn tốt hơn.
          </p>
        </div>

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                category === c.id
                  ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                  : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted)] hover:border-[var(--green)]/40"
              }`}
            >
              {CATEGORY_EMOJI[c.id]} {c.label}
            </button>
          ))}
        </div>

        {loadingProducts ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[20px] bg-[var(--surface)]" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl opacity-30">🌿</span>
            <p className="text-[14px] text-[var(--muted)]">Chưa có sản phẩm trong danh mục này.</p>
          </div>
        )}
      </section>
    </div>
  );
}
