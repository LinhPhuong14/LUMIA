"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Star,
  Truck,
  Shield,
  RefreshCw,
  ArrowRight,
  Plus,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import type { Route } from "next";

import { getAllPurchasableProducts, type BoxProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";

type StoreVariant = { name: string; image_url?: string | null; stock_quantity?: number | null };

type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price_vnd: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  variants?: StoreVariant[] | null;
};

type PlanTab = "digital" | "hybrid";

const TIER_EMOJI: Record<string, string> = {
  first_time: "🎁",
  standard: "📱",
  plus: "⭐",
  pro: "💎",
  premium: "🌸",
  ultimate: "🏆",
};

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "scent", label: "Nến thơm" },
  { id: "drink", label: "Trà & thức uống" },
  { id: "sleep", label: "Ngủ ngon" },
  { id: "meditation", label: "Thiền định" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  all: "🌿",
  scent: "🕯️",
  drink: "🍵",
  sleep: "🌙",
  meditation: "✨",
};

const TRUST_BADGES = [
  { icon: Truck, label: "Giao hàng miễn phí", sub: "Đơn từ 500.000 ₫" },
  { icon: Shield, label: "Thanh toán an toàn", sub: "Mã hóa SSL 256-bit" },
  { icon: RefreshCw, label: "Đổi trả dễ dàng", sub: "Trong vòng 7 ngày" },
  { icon: Star, label: "Đánh giá 4.9/5", sub: "Từ 2.000+ người dùng" },
];

const PRODUCTS_PER_PAGE = 6;

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

/* ── Promo Banner ── */
function PromoBanner({ box }: { box: BoxProduct }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] border border-amber-300/40 dark:border-amber-500/20"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb,#fffbeb 90%,transparent) 0%, color-mix(in srgb,#fef3c7 90%,transparent) 50%, color-mix(in srgb,#fde68a 80%,transparent) 100%)",
      }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 hidden dark:block rounded-[24px]"
        style={{ background: "linear-gradient(135deg,rgba(120,80,0,0.28) 0%,rgba(90,55,0,0.38) 100%)" }} />
      <div className="relative z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-3xl shadow-sm">
            🎁
          </div>
          <div>
            <span className="inline-block rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow">
              Ưu đãi người dùng mới
            </span>
            <h3 className="mt-1.5 font-serif text-[20px] font-semibold leading-tight text-amber-900 dark:text-amber-200">
              {box.name}
            </h3>
            <p className="mt-0.5 text-[13px] text-amber-700 dark:text-amber-300">
              App Premium 1 tháng + Bộ quà tặng giao tận nhà
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div>
            <span className="block text-[11px] text-amber-600 dark:text-amber-400 line-through">699.000 ₫</span>
            <span className="font-sans text-[30px] font-bold leading-none text-amber-900 dark:text-amber-100">
              {formatVnd(box.price)}
            </span>
          </div>
          <Link
            href={`/boxes/${box.slug}` as Route}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-amber-600 hover:shadow-lg"
          >
            <Gift className="h-3.5 w-3.5" />
            Nhận ưu đãi
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Plan Card ── */
function PlanCard({ box, index, boxImageUrl }: { box: BoxProduct; index: number; boxImageUrl?: string | null }) {
  const isFeatured = box.featured;
  const isHybrid = box.group === "hybrid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.06 }}
      className={`group relative flex flex-col overflow-hidden rounded-[22px] border transition-all duration-300 hover:-translate-y-1.5 ${
        isFeatured
          ? "border-[var(--green)] shadow-[0_8px_32px_rgba(95,111,82,0.22)] dark:shadow-[0_8px_32px_rgba(95,111,82,0.35)]"
          : "border-[var(--border)] hover:border-[var(--green)]/40 hover:shadow-[0_12px_32px_rgba(95,111,82,0.14)]"
      }`}
    >
      {isFeatured && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow">
          <Star className="h-2.5 w-2.5" fill="currentColor" />
          Phổ biến nhất
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden p-6 pb-5">
        {/* Light mode: brand gradient */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{ background: box.gradient ?? "linear-gradient(135deg, var(--green-wash) 0%, var(--surface) 100%)" }}
        />
        {/* Dark mode: clean surface + green accent strip */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: isFeatured
              ? "linear-gradient(160deg, rgba(72,95,58,0.45) 0%, var(--surface-card) 55%)"
              : "var(--surface-card)",
          }}
        />
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{TIER_EMOJI[box.tier] ?? "🌿"}</span>
            {isHybrid && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <Package className="h-2.5 w-2.5" />
                Kèm hộp quà
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
            {isHybrid ? "GÓI KÈM HỘP QUÀ" : "GÓI SỐ"}
          </p>
          <h3 className="mt-0.5 font-serif text-[19px] font-semibold leading-tight text-[var(--foreground)]">
            {box.name}
          </h3>
          <p className="mt-1 text-[12px] text-[var(--muted)]">{box.tagline}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-sans text-[30px] font-bold leading-none text-[var(--foreground)]">
              {formatVnd(box.price)}
            </span>
            {box.priceNote && (
              <span className="text-[12px] text-[var(--muted)]">{box.priceNote}</span>
            )}
          </div>
          {box.savingsNote && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--green-wash)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--green-deep)]">
              <Sparkles className="h-2.5 w-2.5" />
              {box.savingsNote}
            </span>
          )}
        </div>
      </div>

      {/* Box image — hybrid plans only */}
      {isHybrid && boxImageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={boxImageUrl} alt="Ảnh hộp quà" className="h-44 w-full object-cover" />
      )}

      {/* Body */}
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

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/boxes/${box.slug}` as Route}
            className={`flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold transition ${
              isFeatured
                ? "bg-[var(--green)] text-white hover:opacity-90 hover:shadow-[0_6px_18px_rgba(95,111,82,0.4)]"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--green)]/50 hover:bg-[var(--green-wash)]"
            }`}
          >
            {box.ctaLabel ?? "Bắt đầu ngay"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/boxes/${box.slug}` as Route}
            className="flex items-center justify-center gap-1 text-[12px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Xem chi tiết
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Variant Picker Modal ── */
function VariantPickerModal({
  product,
  onClose,
  onSelect,
}: {
  product: StoreProduct;
  onClose: () => void;
  onSelect: (variant: StoreVariant) => void;
}) {
  const variants = product.variants ?? [];
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[24px] bg-[var(--surface)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">Chọn phân loại</p>
            <h3 className="mt-0.5 font-serif text-[18px] font-semibold text-[var(--foreground)]">{product.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {variants.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => onSelect(v)}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-3 transition hover:border-[var(--green)] hover:bg-[var(--green-wash)]"
            >
              {v.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.image_url} alt={v.name} className="h-16 w-16 rounded-[10px] object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--green-wash)] text-2xl">🌿</div>
              )}
              <span className="text-center text-[12.5px] font-medium leading-tight text-[var(--foreground)]">{v.name}</span>
            </button>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}

/* ── Product Card ── */
function ProductCard({ product, index, basePath = "/store", isLoggedIn = true }: { product: StoreProduct; index: number; basePath?: string; isLoggedIn?: boolean }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [showVariantPicker, setShowVariantPicker] = useState(false);

  const variants = product.variants?.filter(v => v.name.trim()) ?? [];
  const hasVariants = variants.length > 1;

  function doAdd(variant: StoreVariant | null) {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price_vnd: product.price_vnd,
      image_url: variant?.image_url ?? product.image_url,
      variant: variant?.name ?? null,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login?next=/store");
      return;
    }
    if (hasVariants) {
      setShowVariantPicker(true);
      return;
    }
    doAdd(variants[0] ?? null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: (index % PRODUCTS_PER_PAGE) * 0.05 }}
    >
      <Link
        href={`${basePath}/${product.slug}` as Route}
        className="group flex flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-0.5 hover:border-[var(--green)]/30 hover:shadow-[0_12px_32px_rgba(95,111,82,0.14)] dark:hover:shadow-[0_12px_32px_rgba(95,111,82,0.22)]"
      >
        {/* Image */}
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--green-wash)] to-[var(--surface)]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[52px] leading-none drop-shadow-sm" style={{ filter: "saturate(0.7) opacity(0.55)" }}>
                {CATEGORY_EMOJI[product.category] ?? "🌿"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green-deep)] opacity-40">
                {CATEGORIES.find(c => c.id === product.category)?.label ?? "Sản phẩm"}
              </span>
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
              <span className="rounded-full bg-[var(--surface)]/90 px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--green)]">
              {CATEGORY_EMOJI[product.category]} {CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category}
            </p>
            <h3 className="mt-1 font-serif text-[15px] font-medium leading-snug text-[var(--foreground)]">
              {product.name}
            </h3>
            {product.subtitle && (
              <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{product.subtitle}</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-sans text-[16px] font-bold text-[var(--foreground)]">
              {formatVnd(product.price_vnd)}
            </span>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.in_stock || added}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                added
                  ? "bg-[var(--green-wash)] text-[var(--green-deep)]"
                  : "bg-[var(--green)] text-white hover:opacity-90 hover:shadow-[0_4px_12px_rgba(95,111,82,0.4)]"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-3 w-3" /> Đã thêm
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> {hasVariants ? "Chọn loại" : "Thêm"}
                </>
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11.5px] text-[var(--muted)] transition group-hover:text-[var(--green-deep)]">
            Xem chi tiết <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </Link>

      {showVariantPicker && (
        <VariantPickerModal
          product={product}
          onClose={() => setShowVariantPicker(false)}
          onSelect={(v) => { setShowVariantPicker(false); doAdd(v); }}
        />
      )}
    </motion.div>
  );
}

/* ── Trust strip ── */
function TrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-wash)]">
            <Icon className="h-4.5 w-4.5 text-[var(--green)]" />
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-[var(--foreground)]">{label}</p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ── */
export function UnifiedStore({ stickyTop = "var(--marketing-header-height, 64px)", hideRegisterCta = false, productBasePath = "/store", isLoggedIn = true }: { stickyTop?: string; hideRegisterCta?: boolean; productBasePath?: string; isLoggedIn?: boolean } = {}) {
  const { count } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState<Array<{id: string; status: string; items: unknown[]; total_vnd: number; created_at: string}>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [planTab, setPlanTab] = useState<PlanTab>("digital");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [dbPlanImages, setDbPlanImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/store/plans")
      .then(r => r.json())
      .then((data: Array<{ id: string; box_image_url?: string | null }>) => {
        const map: Record<string, string> = {};
        data.forEach(p => { if (p.id && p.box_image_url) map[p.id] = p.box_image_url; });
        setDbPlanImages(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setOrdersLoading(true);
    fetch("/api/store/orders")
      .then(r => r.json())
      .then(data => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoadingProducts(true);
    setShowAllProducts(false);
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

  const visibleProducts = showAllProducts ? products : products.slice(0, PRODUCTS_PER_PAGE);

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="space-y-16 pb-24">

      {/* Sticky search + tab bar */}
      <div
        className="sticky z-20 -mx-4 border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{
          top: stickyTop,
          background: "color-mix(in srgb, var(--surface) 88%, transparent)",
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
              className="h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-10 pr-10 text-[13.5px] text-[var(--foreground)] outline-none ring-[var(--green)]/20 transition placeholder:text-[var(--muted)] focus:border-[var(--green)]/50 focus:ring-4"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
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

      {/* Section 0 - Orders & Cart */}
      <section id="don-hang">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
              Đơn hàng của tôi
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]/50"
          >
            <ShoppingCart className="h-4 w-4" />
            Giỏ hàng
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--green)] text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-[16px] bg-[var(--surface)]" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] py-8 text-center">
            <Package className="h-8 w-8 opacity-30" style={{ color: "var(--muted)" }} />
            <p className="text-[13px] text-[var(--muted)]">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusLabel: Record<string, string> = {
                pending_payment: "Chờ thanh toán",
                paid: "Đã thanh toán",
                preparing: "Đang chuẩn bị",
                shipping: "Đang giao hàng",
                delivered: "Đã giao hàng",
              };
              return (
                <div key={order.id} className="flex items-center justify-between rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--foreground)]">
                      Đơn #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-[var(--foreground)]">
                      {order.total_vnd.toLocaleString("vi-VN")} ₫
                    </p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      order.status === "delivered" ? "bg-[var(--green-wash)] text-[var(--green-deep)]" :
                      order.status === "shipping" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" :
                      "bg-[var(--surface)] text-[var(--muted)]"
                    }`}>
                      {statusLabel[order.status] ?? "Đang xử lý"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCart && <CartSheet onClose={() => setShowCart(false)} />}
      </section>

      {/* Section 1 - Subscription plans */}
      <section id="goi-lumia">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
              Gói thành viên
            </span>
          </div>
          <h2 className="mt-1 font-serif text-[26px] font-semibold leading-tight text-[var(--foreground)] sm:text-[30px]">
            Chọn gói LUMIA cho bạn
          </h2>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">
            Truy cập toàn bộ tính năng Premium. Một số gói kèm hộp quà wellbeing giao tận nhà.
          </p>
        </div>

        {promoBox && !debouncedSearch && (
          <div className="mb-8">
            <PromoBanner box={promoBox} />
          </div>
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
              filteredPlans.map((box, i) => <PlanCard key={box.slug} box={box} index={i} boxImageUrl={dbPlanImages[box.tier]} />)
            ) : (
              <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
                <span className="text-4xl opacity-30">🔍</span>
                <p className="text-[14px] text-[var(--muted)]">Không tìm thấy gói phù hợp.</p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-[13px] font-medium text-[var(--green-deep)] underline"
                >
                  Xoá tìm kiếm
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Section 2 - Physical products */}
      <section id="san-pham">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[var(--green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
              Sản phẩm wellbeing
            </span>
          </div>
          <div className="mt-1 flex items-end justify-between gap-3">
            <h2 className="font-serif text-[26px] font-semibold leading-tight text-[var(--foreground)] sm:text-[30px]">
              Chăm sóc từng khoảnh khắc
            </h2>
            {products.length > 0 && (
              <span className="shrink-0 text-[12px] text-[var(--muted)]">
                {products.length} sản phẩm
              </span>
            )}
          </div>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">
            Sản phẩm chọn lọc để tạo không gian ngủ và thư giãn tốt hơn.
          </p>
        </div>

        {/* Category filter */}
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

        {/* Products grid */}
        {loadingProducts ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-[18px] bg-[var(--surface)]" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <AnimatePresence>
                {visibleProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} basePath={productBasePath} isLoggedIn={isLoggedIn} />
                ))}
              </AnimatePresence>
            </div>
            {!showAllProducts && products.length > PRODUCTS_PER_PAGE && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllProducts(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-6 py-3 text-[13px] font-semibold text-[var(--foreground)] transition hover:border-[var(--green)]/50 hover:bg-[var(--green-wash)] hover:text-[var(--green-deep)]"
                >
                  Xem thêm {products.length - PRODUCTS_PER_PAGE} sản phẩm
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl opacity-30">🌿</span>
            <p className="text-[14px] text-[var(--muted)]">Chưa có sản phẩm trong danh mục này.</p>
          </div>
        )}
      </section>

      {/* Section 3 - CTA banner (hidden inside dashboard for logged-in users) */}
      {!hideRegisterCta && <section>
        <div
          className="relative overflow-hidden rounded-[28px] p-8 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, var(--green-wash) 0%, color-mix(in srgb, var(--green-wash) 60%, var(--surface)) 100%)",
            border: "1px solid var(--green)/30",
          }}
        >
          <div className="relative z-10 flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                Bắt đầu hành trình
              </p>
              <h3 className="mt-1 font-serif text-[24px] font-semibold leading-tight text-[var(--foreground)] sm:text-[28px]">
                Chưa có tài khoản LUMIA?
              </h3>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                Thử miễn phí 3 lần chat mỗi ngày. Nâng cấp bất kỳ lúc nào.
              </p>
            </div>
            <Link
              href={"/register" as Route}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--green)] px-7 py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 hover:shadow-[0_8px_24px_rgba(95,111,82,0.45)]"
            >
              Đăng ký miễn phí
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>}
    </div>
  );
}
