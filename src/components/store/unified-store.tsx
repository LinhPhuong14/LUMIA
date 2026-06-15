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
  Gift,
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

type PlanTab = "digital" | "hybrid";

const TIER_EMOJI: Record<string, string> = {
  first_time: "🎁", standard: "📱", plus: "⭐", pro: "💎", premium: "🌸", ultimate: "🏆",
};

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "scent", label: "Nến thơm" },
  { id: "drink", label: "Trà & thức uống" },
  { id: "sleep", label: "Ngủ ngon" },
  { id: "meditation", label: "Thiền định" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  all: "🌿", scent: "🕯️", drink: "🍵", sleep: "🌙", meditation: "✨",
};

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function PromoBanner({ box }: { box: BoxProduct }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
        border: "1px solid rgba(245,158,11,0.3)",
        boxShadow: "0 4px 24px rgba(251,191,36,0.18)",
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">🎁</div>
          <div>
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Ưu đãi người dùng mới
            </span>
            <h3 className="mt-1.5 font-serif text-[20px] font-semibold leading-tight text-amber-900">{box.name}</h3>
            <p className="mt-0.5 text-[13px] text-amber-700">App Premium 1 tháng + Welcome Kit giao tận nhà</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span className="font-sans text-[28px] font-bold text-amber-900">{formatVnd(box.price)}</span>
          <Link
            href={`/boxes/${box.slug}` as Route}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-amber-600"
            style={{ boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
          >
            <Gift className="h-3.5 w-3.5" />
            Nhận ưu đãi
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function PlanCard({ box }: { box: BoxProduct }) {
  const isFeatured = box.featured;
  const isHybrid = box.group === "hybrid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`relative flex flex-col overflow-hidden rounded-[22px] border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(95,111,82,0.16)] ${
        isFeatured
          ? "border-[var(--green)] shadow-[0_8px_32px_rgba(95,111,82,0.20)]"
          : "border-[var(--border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      }`}
    >
      {isFeatured && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
          Phổ biến nhất
        </div>
      )}

      <div className="p-6 pb-5" style={{ background: box.gradient }}>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{TIER_EMOJI[box.tier] ?? "🌿"}</span>
          {isHybrid && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
              <Package className="h-2.5 w-2.5" />
              Kèm hộp quà
            </span>
          )}
        </div>
        <h3 className="font-serif text-[19px] font-semibold leading-tight text-[var(--green-deep)]">{box.name}</h3>
        <p className="mt-1 text-[12px] text-[var(--muted)]">{box.tagline}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-sans text-[30px] font-bold leading-none text-[var(--foreground)]">
            {formatVnd(box.price)}
          </span>
          {box.priceNote && <span className="text-[12px] text-[var(--muted)]">{box.priceNote}</span>}
        </div>
        {box.savingsNote && (
          <span className="mt-2 inline-block rounded-full bg-[var(--green-wash)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--green-deep)]">
            {box.savingsNote}
          </span>
        )}
      </div>

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
          className={`mt-5 flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold transition hover:opacity-90 ${
            isFeatured
              ? "bg-[var(--green)] text-white"
              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--green)]/50"
          }`}
        >
          {box.ctaLabel ?? "Xem gói"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle, price_vnd: product.price_vnd, image_url: product.image_url, variant: null, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)]">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--green-wash)] to-[var(--surface)]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="text-5xl opacity-30">{CATEGORY_EMOJI[product.category] ?? "🌿"}</span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="font-serif text-[15px] font-medium leading-snug text-[var(--foreground)]">{product.name}</h3>
          {product.subtitle && <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{product.subtitle}</p>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-sans text-[15px] font-bold text-[var(--foreground)]">{formatVnd(product.price_vnd)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.in_stock || added}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              added ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-[var(--green)] text-white hover:opacity-90"
            }`}
          >
            {added ? <><Check className="h-3 w-3" /> Đã thêm</> : <><ShoppingBag className="h-3 w-3" /> Thêm</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnifiedStore() {
  const [planTab, setPlanTab] = useState<PlanTab>("digital");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoadingProducts(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (debouncedSearch) params.set("search", debouncedSearch);
    const qs = params.toString();
    fetch(`/api/store/products${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [category, debouncedSearch]);

  const allBoxes = getAllPurchasableProducts();
  const promoBox = allBoxes.find((b) => b.group === "promo");
  const planBoxes = allBoxes.filter((b) =>
    planTab === "digital" ? b.group === "digital" : b.group === "hybrid",
  );
  const filteredPlans = debouncedSearch
    ? planBoxes.filter(
        (b) =>
          b.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          b.tagline.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : planBoxes;

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="space-y-16 pb-20">

      {/* Sticky search + plan tab bar */}
      <div
        className="sticky z-20 -mx-4 border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{
          top: "var(--marketing-header-height, 64px)",
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm gói hoặc sản phẩm..."
              className="h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-10 pr-10 text-[13.5px] text-[var(--foreground)] outline-none ring-[var(--green)]/20 transition focus:border-[var(--green)]/50 focus:ring-4"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex shrink-0 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
            {(["digital", "hybrid"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPlanTab(t)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition ${
                  planTab === t
                    ? "bg-[var(--surface-card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t === "digital" ? "📱 Gói số" : "📦 Kèm hộp quà"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1 — Subscription plans */}
      <section id="goi-lumia">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">Gói thành viên</span>
          </div>
          <h2 className="mt-1 font-serif text-[26px] font-semibold leading-tight text-[var(--foreground)] sm:text-[30px]">
            Chọn gói LUMIA cho bạn
          </h2>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">
            Truy cập toàn bộ tính năng Premium. Một số gói kèm hộp quà wellbeing giao tận nhà.
          </p>
        </div>

        {promoBox && !debouncedSearch && (
          <div className="mb-8"><PromoBanner box={promoBox} /></div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={planTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPlans.length > 0 ? (
              filteredPlans.map((box) => <PlanCard key={box.slug} box={box} />)
            ) : (
              <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
                <span className="text-4xl opacity-30">🔍</span>
                <p className="text-[14px] text-[var(--muted)]">Không tìm thấy gói phù hợp.</p>
                <button type="button" onClick={clearSearch} className="text-[13px] font-medium text-[var(--green-deep)] underline">
                  Xoá tìm kiếm
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Section 2 — Physical products */}
      <section id="san-pham">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">Sản phẩm</span>
          </div>
          <h2 className="mt-1 font-serif text-[26px] font-semibold leading-tight text-[var(--foreground)] sm:text-[30px]">
            Wellbeing Store
          </h2>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">
            Sản phẩm chọn lọc để tạo không gian ngủ và thư giãn tốt hơn.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                category === c.id
                  ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                  : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted)] hover:border-[var(--green)]/40 hover:text-[var(--foreground)]"
              }`}
            >
              {CATEGORY_EMOJI[c.id]} {c.label}
            </button>
          ))}
        </div>

        {loadingProducts ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[18px] bg-[var(--surface)]" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
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
