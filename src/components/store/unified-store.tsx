"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Check,
  Package,
  Sparkles,
  ChevronRight,
  X,
  SlidersHorizontal,
} from "lucide-react";
import type { Route } from "next";

import { getAllPurchasableProducts, type BoxProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";

type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price_vnd: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
};

type TabId = "digital" | "hybrid";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "scent", label: "Hương thơm" },
  { id: "drink", label: "Đồ uống" },
  { id: "sleep", label: "Ngủ ngon" },
  { id: "meditation", label: "Thiền" },
];

function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " ₫";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function PlanCard({ plan, searchQuery }: { plan: BoxProduct; searchQuery: string }) {
  const isFeatured = plan.featured === true;
  const q = searchQuery.toLowerCase();
  if (q && !plan.name.toLowerCase().includes(q) && !plan.tagline.toLowerCase().includes(q)) {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex flex-col overflow-hidden rounded-[28px] border shadow-[0_8px_24px_rgba(95,111,82,0.08)] transition-shadow hover:shadow-[0_16px_40px_rgba(95,111,82,0.16)] ${
        isFeatured
          ? "border-[var(--green)] ring-2 ring-[var(--green)]/20"
          : "border-[var(--border)]"
      }`}
      style={{ background: plan.gradient }}
    >
      {isFeatured ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
          Phổ biến nhất
        </div>
      ) : null}

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

        <div className="mt-5">
          <div className="font-serif text-[30px] font-bold leading-none text-[var(--green-deep)]">
            {formatVnd(plan.price)}
          </div>
          {plan.priceNote ? (
            <p className="mt-1.5 text-[12px] text-[var(--muted)]">{plan.priceNote}</p>
          ) : null}
        </div>

        {plan.savingsNote ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
            <Sparkles className="h-3 w-3" />
            {plan.savingsNote}
          </div>
        ) : null}
      </div>

      <div className="flex-1 space-y-2 border-t border-black/[0.06] px-6 py-4">
        {plan.features.slice(0, 5).map((feature) => (
          <div key={feature} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/20">
              <Check className="h-2.5 w-2.5 text-[var(--green-deep)]" />
            </div>
            <span className="text-[13px] leading-5 text-[var(--foreground)]">{feature}</span>
          </div>
        ))}
        {plan.physicalItems.slice(0, 3).map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Package className="h-2.5 w-2.5 text-amber-600" />
            </div>
            <span className="text-[13px] leading-5 text-[var(--foreground)]">{item}</span>
          </div>
        ))}
      </div>

      {plan.group === "hybrid" ? (
        <div className="mx-6 mb-4 flex items-center gap-2 rounded-[12px] bg-amber-50 px-3 py-2.5">
          <Package className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-[12px] font-medium text-amber-700">Kèm hộp quà gửi tận nhà</span>
        </div>
      ) : null}

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

function ProductCard({
  product,
  onAdd,
}: {
  product: StoreProduct;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_4px_16px_rgba(95,111,82,0.07)] transition hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)]">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--green-wash)]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">🌿</span>
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
        <h3 className="font-serif text-[15px] font-semibold leading-snug text-[var(--foreground)]">
          {product.name}
        </h3>
        {product.subtitle ? (
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{product.subtitle}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-[14px] font-bold text-[var(--green-deep)]">
            {formatVnd(product.price_vnd)}
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.in_stock}
            className="flex items-center gap-1.5 rounded-full bg-[var(--green)] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)]">
      <div className="h-44 bg-[var(--green-wash)]/60" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-full bg-[var(--border)]" />
        <div className="h-3 w-1/2 rounded-full bg-[var(--border)]" />
        <div className="mt-4 h-8 w-1/3 rounded-full bg-[var(--border)]" />
      </div>
    </div>
  );
}

export function UnifiedStore() {
  const { addItem } = useCart();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [activeTab, setActiveTab] = useState<TabId>("digital");
  const [activeCategory, setActiveCategory] = useState("all");

  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const allPlans = getAllPurchasableProducts();
  const promoBox = allPlans.find((b) => b.group === "promo");
  const digitalPlans = allPlans.filter((b) => b.group === "digital");
  const hybridPlans = allPlans.filter((b) => b.group === "hybrid");
  const displayPlans = activeTab === "digital" ? digitalPlans : hybridPlans;

  const fetchProducts = useCallback(
    (category: string, query: string) => {
      setLoadingProducts(true);
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (query) params.set("search", query);
      const qs = params.toString();
      fetch(`/api/store/products${qs ? `?${qs}` : ""}`)
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((data: { products?: StoreProduct[] } | StoreProduct[]) => {
          const products = Array.isArray(data) ? data : (data.products ?? []);
          setStoreProducts(products);
        })
        .catch(() => setStoreProducts([]))
        .finally(() => setLoadingProducts(false));
    },
    [],
  );

  useEffect(() => {
    fetchProducts(activeCategory, debouncedSearch);
  }, [activeCategory, debouncedSearch, fetchProducts]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "digital", label: "Gói số" },
    { id: "hybrid", label: "Gói kèm hộp quà" },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                placeholder="Tìm gói hoặc sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] py-2.5 pl-9 pr-10 text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--muted)]" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${
                    activeCategory === cat.id
                      ? "border-[var(--green)] bg-[var(--green)] text-white"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]/50 hover:text-[var(--foreground)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {promoBox ? (
        <section className="relative overflow-hidden border-b border-amber-200 bg-gradient-to-r from-amber-50 via-amber-100 to-yellow-50 px-4 py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-200/60 text-2xl">
                🎁
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                    Ưu đãi người dùng mới
                  </span>
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                    Welcome Kit
                  </span>
                </div>
                <h2 className="mt-0.5 font-serif text-xl font-semibold text-amber-900 sm:text-2xl">
                  {promoBox.name} · {formatVnd(promoBox.price)}
                </h2>
                <p className="mt-1 max-w-md text-[12px] leading-5 text-amber-800/80">
                  {promoBox.description}
                </p>
              </div>
            </div>

            <Link
              href="/boxes/first-time-user"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-amber-600"
            >
              Dùng thử ngay
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex flex-col items-center gap-5">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
              Gói đăng ký
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--green-deep)] sm:text-4xl">
              Chọn hành trình phù hợp với bạn
            </h2>
          </div>

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
              <PlanCard key={plan.slug} plan={plan} searchQuery={debouncedSearch} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="mx-auto max-w-6xl border-t border-[var(--border)] px-4 py-14">
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
            Wellbeing Store
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[var(--green-deep)]">
            Sản phẩm chăm sóc sức khỏe tinh thần
          </h2>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : storeProducts.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {storeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() =>
                  addItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    subtitle: product.subtitle,
                    price_vnd: product.price_vnd,
                    image_url: product.image_url,
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
