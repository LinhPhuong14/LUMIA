"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Check,
  Package,
  Sparkles,
  ChevronRight,
  Star,
  Gift,
} from "lucide-react";

import { getAllPurchasableProducts, type BoxProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoreProduct = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  category: string;
  emoji?: string;
  imageUrl?: string;
};

export type TabId = "digital" | "hybrid";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

// ---------------------------------------------------------------------------
// PlanCard
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: BoxProduct }) {
  const isFeatured = plan.featured === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
      className={`relative flex flex-col overflow-hidden rounded-[28px] border transition-shadow hover:shadow-[0_16px_40px_rgba(95,111,82,0.16)] ${
        isFeatured
          ? "border-[var(--green)] shadow-[0_8px_24px_rgba(95,111,82,0.14)]"
          : "border-[var(--border)] shadow-[0_4px_16px_rgba(95,111,82,0.07)]"
      } bg-[var(--surface-card)]`}
    >
      {/* Featured badge */}
      {isFeatured ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow">
          <Star className="h-3 w-3" />
          Phổ biến nhất
        </div>
      ) : null}

      {/* Gradient header */}
      <div
        className="flex flex-col gap-2 px-6 pb-5 pt-6"
        style={{ background: plan.gradient }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden>
            {plan.group === "hybrid" ? "📦" : "✨"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-semibold leading-snug text-[var(--green-deep)]">
              {plan.name}
            </h3>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/60 px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)] backdrop-blur-sm">
              {plan.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--green-deep)]">
              {formatVnd(plan.price)}
            </span>
          </div>
          {plan.priceNote ? (
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">{plan.priceNote}</p>
          ) : null}
          {plan.savingsNote ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--green-wash)] px-3 py-1 text-[11px] font-semibold text-[var(--green-deep)]">
              <Sparkles className="h-3 w-3" />
              {plan.savingsNote}
            </span>
          ) : null}
        </div>

        {/* Features */}
        <ul className="flex-1 space-y-2">
          {plan.features.slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[13px] text-[var(--foreground)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green)]" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Hybrid chip */}
        {plan.group === "hybrid" ? (
          <div className="flex items-center gap-1.5 rounded-[14px] bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700">
            <Package className="h-3.5 w-3.5 shrink-0" />
            Kèm hộp quà
          </div>
        ) : null}

        {/* CTA */}
        <Link
          href={`/boxes/${plan.slug}` as Route}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
        >
          {plan.ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

function ProductCard({
  product,
  onAdd,
}: {
  product: StoreProduct;
  onAdd: (p: StoreProduct) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_4px_16px_rgba(95,111,82,0.07)] transition hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)]">
      {/* Image / emoji placeholder */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--green-wash)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-50">{product.emoji ?? "🌿"}</span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[17px] font-semibold text-[var(--foreground)]">
          {product.name}
        </h3>
        {product.subtitle ? (
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{product.subtitle}</p>
        ) : null}
        <p className="mt-3 text-[15px] font-bold text-[var(--green-deep)]">
          {formatVnd(product.price)}
        </p>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" />
          Thêm
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UnifiedStore (main export)
// ---------------------------------------------------------------------------

export function UnifiedStore() {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<TabId>("digital");
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const allPlans = getAllPurchasableProducts();
  const digitalPlans = allPlans.filter((p) => p.group === "digital");
  const hybridPlans = allPlans.filter((p) => p.group === "hybrid");
  const promoBox = allPlans.find((p) => p.tier === "first_time");
  const displayPlans = activeTab === "digital" ? digitalPlans : hybridPlans;

  useEffect(() => {
    fetch("/api/store/products")
      .then((r) => r.json())
      .then((data: unknown) => {
        // API may return { products: [...] } or directly an array
        const arr = Array.isArray(data)
          ? data
          : Array.isArray((data as { products?: unknown[] }).products)
          ? (data as { products: StoreProduct[] }).products
          : [];
        setStoreProducts(arr as StoreProduct[]);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(storeProducts.map((p) => p.category))),
  ];

  const filteredProducts =
    activeCategory === "all"
      ? storeProducts
      : storeProducts.filter((p) => p.category === activeCategory);

  function handleAddProduct(p: StoreProduct) {
    addItem({
      id: p.id,
      slug: p.id,
      name: p.name,
      subtitle: p.subtitle ?? null,
      price_vnd: p.price,
      image_url: p.imageUrl ?? null,
      qty: 1,
    });
  }

  return (
    <div className="space-y-12">
      {/* ── Promo Banner ──────────────────────────────────────────────── */}
      {promoBox ? (
        <div className="rounded-[28px] bg-gradient-to-br from-[#e8f5e0] via-[#f0f9ea] to-[#fffdf5] p-6 shadow-[0_8px_28px_rgba(95,111,82,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--green)] text-white shadow">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green-deep)]">
                  Ưu đãi người dùng mới
                </span>
                <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--green-deep)]">
                  {promoBox.name}
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">
                  {promoBox.description}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <div className="text-right">
                <span className="font-serif text-2xl font-bold text-[var(--green-deep)]">
                  {formatVnd(promoBox.price)}
                </span>
                <p className="text-[12px] text-[var(--muted)]">{promoBox.duration}</p>
              </div>
              <Link
                href={`/boxes/${promoBox.slug}` as Route}
                className="flex items-center gap-2 rounded-full bg-[var(--green)] px-5 py-2.5 text-[14px] font-semibold text-white shadow transition hover:opacity-90"
              >
                Khám phá ngay
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Subscription Plans ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">
              Gói thành viên
            </span>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[var(--foreground)]">
              Chọn gói phù hợp với bạn
            </h2>
          </div>

          {/* Tab pills */}
          <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface-card)] p-1 shadow-sm">
            {(["digital", "hybrid"] as TabId[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  activeTab === tab
                    ? "bg-[var(--green)] text-white shadow"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab === "digital" ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Digital
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Hybrid
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayPlans.map((plan) => (
              <PlanCard key={plan.slug} plan={plan} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Physical Products ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">
            Sản phẩm vật lý
          </span>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[var(--foreground)]">
            Cửa hàng LUMIA
          </h2>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                activeCategory === cat
                  ? "border-[var(--green)] bg-[var(--green)] text-white"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)]"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-[var(--green)] opacity-20" />
            <p className="text-[14px] text-[var(--muted)]">
              Chưa có sản phẩm nào. Hãy quay lại sớm nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAddProduct} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
