"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import type { Route } from "next";

import { getAllPurchasableProducts, type BoxProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoreProduct = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  category: string;
  emoji?: string;
  imageUrl?: string;
};

type TabId = "digital" | "hybrid";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " ₫";
}

// ---------------------------------------------------------------------------
// PlanCard
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: BoxProduct }) {
  const isFeatured = plan.featured === true;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex flex-col overflow-hidden rounded-[28px] border shadow-[0_8px_24px_rgba(95,111,82,0.08)] transition-shadow hover:shadow-[0_16px_40px_rgba(95,111,82,0.16)] ${
        isFeatured
          ? "border-[var(--green)] ring-2 ring-[var(--green)]/20"
          : "border-[var(--border)]"
      }`}
      style={{ background: plan.gradient }}
    >
      {/* Featured badge */}
      {isFeatured ? (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Star className="h-3 w-3" />
          Phổ biến nhất
        </div>
      ) : null}

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/60 text-2xl shadow-sm">
            {plan.group === "hybrid" ? "📦" : "📱"}
          </div>
          <div className="min-w-0">
            <h3 className="font-sans text-[15px] font-bold leading-tight text-[var(--green-deep)]">
              {plan.name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-white/50 px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]">
              {plan.duration}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-5">
          <div className="font-serif text-3xl font-semibold text-[var(--green-deep)]">
            {formatVnd(plan.price)}
          </div>
          {plan.priceNote ? (
            <p className="mt-1 text-[12px] text-[var(--muted)]">{plan.priceNote}</p>
          ) : null}
        </div>

        {/* Savings badge */}
        {plan.savingsNote ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
            <Sparkles className="h-3 w-3" />
            {plan.savingsNote}
          </div>
        ) : null}
      </div>

      {/* Features */}
      <div className="flex-1 space-y-2 border-t border-black/[0.06] px-6 py-4">
        {plan.features.slice(0, 5).map((feature) => (
          <div key={feature} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/20">
              <Check className="h-2.5 w-2.5 text-[var(--green-deep)]" />
            </div>
            <span className="text-[13px] leading-5 text-[var(--foreground)]">{feature}</span>
          </div>
        ))}
      </div>

      {/* Hybrid chip */}
      {plan.group === "hybrid" ? (
        <div className="mx-6 mb-4 flex items-center gap-2 rounded-[12px] bg-amber-50 px-3 py-2.5">
          <Package className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-[12px] font-medium text-amber-700">Kèm hộp quà gửi tận nhà</span>
        </div>
      ) : null}

      {/* CTA */}
      <div className="px-6 pb-6">
        <Link
          href={`/boxes/${plan.slug}` as Route}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold transition hover:opacity-90 ${
            isFeatured
              ? "bg-[var(--green)] text-white shadow-md"
              : "bg-white/80 text-[var(--green-deep)] ring-1 ring-[var(--border)]"
          }`}
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
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(95,111,82,0.07)] transition hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)]">
      {/* Image / emoji */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--green-wash)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">{product.emoji ?? "🌿"}</span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[var(--green)] px-3 py-1 text-[11px] font-bold text-white shadow">
          {formatVnd(product.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[16px] font-semibold text-[var(--foreground)]">
          {product.name}
        </h3>
        {product.subtitle ? (
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{product.subtitle}</p>
        ) : null}

        <button
          type="button"
          onClick={onAdd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)]">
      <div className="h-48 bg-[var(--green-wash)]/60" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded-full bg-[var(--border)]" />
        <div className="h-3 w-1/2 rounded-full bg-[var(--border)]" />
        <div className="mt-4 h-9 rounded-full bg-[var(--border)]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UnifiedStore
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
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products?: StoreProduct[] } | StoreProduct[]) => {
        const products = Array.isArray(data) ? data : (data.products ?? []);
        setStoreProducts(products);
      })
      .catch(() => {
        setStoreProducts([]);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(storeProducts.map((p) => p.category))),
  ];

  const filteredProducts =
    activeCategory === "all"
      ? storeProducts
      : storeProducts.filter((p) => p.category === activeCategory);

  const tabs: { id: TabId; label: string }[] = [
    { id: "digital", label: "📱 Chỉ app" },
    { id: "hybrid", label: "📦 Kèm hộp quà" },
  ];

  const categoryLabels: Record<string, string> = {
    all: "Tất cả",
    drink: "Đồ uống",
    scent: "Hương thơm",
    sleep: "Ngủ ngon",
    meditation: "Thiền",
    tea: "Trà",
    candle: "Nến thơm",
    accessories: "Phụ kiện",
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Promo Banner                                             */}
      {/* ------------------------------------------------------------------ */}
      {promoBox ? (
        <section className="relative overflow-hidden bg-gradient-to-r from-[var(--green-deep)] via-[var(--green)] to-emerald-500 py-10 px-4">
          {/* Decorative circles */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/8 blur-2xl"
          />

          <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Ưu đãi lần đầu
                  </span>
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                    Kèm Welcome Kit
                  </span>
                </div>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-white sm:text-3xl">
                  {promoBox.name} · {formatVnd(promoBox.price)}
                </h2>
                <p className="mt-1.5 max-w-md text-[13px] leading-6 text-white/80">
                  {promoBox.description}
                </p>
              </div>
            </div>

            <Link
              href="/boxes/first-time-user"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-bold text-[var(--green-deep)] shadow-lg transition hover:bg-white/90"
            >
              Dùng thử ngay
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Subscription Plans                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
            Gói đăng ký
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--green-deep)] sm:text-4xl">
            Chọn hành trình phù hợp với bạn
          </h2>
        </div>

        {/* Tab pills */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-card)] p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[var(--green)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayPlans.map((plan) => (
              <PlanCard key={plan.slug} plan={plan} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Physical Products (Wellbeing Store)                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-t border-[var(--border)]">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                Wellbeing Store
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--green-deep)]">
                Sản phẩm chăm sóc sức khỏe tinh thần
              </h2>
            </div>
          </div>

          {/* Category filter pills */}
          {!loadingProducts && storeProducts.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
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
                  {categoryLabels[cat] ?? cat}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Products */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-wash)] text-3xl">
              🌿
            </div>
            <h3 className="mt-4 font-serif text-xl text-[var(--green-deep)]">
              Sản phẩm sắp ra mắt
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Chúng mình đang chuẩn bị các sản phẩm wellbeing tốt nhất. Hãy quay lại sớm nhé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() =>
                  addItem({
                    id: product.id,
                    slug: product.id,
                    name: product.name,
                    subtitle: product.subtitle ?? null,
                    price_vnd: product.price,
                    image_url: product.imageUrl ?? null,
                    qty: 1,
                  })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
