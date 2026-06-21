"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check, ShoppingCart, LogIn,
  Package, MapPin, Clock,
} from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";
import { StoreProductTabs } from "@/components/store/store-product-tabs";
import type { FullProduct } from "@/app/store/[slug]/page";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

const CATEGORY_LABEL: Record<string, string> = {
  scent: "Nến & Tinh dầu",
  drink: "Trà & Thức uống",
  sleep: "Ngủ ngon",
  meditation: "Thiền định",
  wellness: "Sức khỏe",
};

/* ── Image Carousel ─────────────────────────────────────── */
function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)]">
      {/* Main image */}
      <div
        className="relative aspect-square w-full cursor-grab overflow-hidden active:cursor-grabbing"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 48) dx > 0 ? next() : prev();
          touchX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt={`Ảnh ${idx + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
          key={images[idx]}
        />

        {/* Badge */}
        {images.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {idx + 1} / {images.length}
          </span>
        )}

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] border-2 transition ${
                i === idx
                  ? "border-[var(--green)] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function StoreProductDetailClient({
  product,
  isLoggedIn,
}: {
  product: FullProduct;
  isLoggedIn: boolean;
}) {
  const { addItem, items, count } = useCart();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].name : null,
  );
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Build ordered image list: banner → gallery → variant images
  const allImages: string[] = [];
  const seen = new Set<string>();
  const addImg = (u: string | null | undefined) => {
    if (u && !seen.has(u)) { seen.add(u); allImages.push(u); }
  };
  addImg(product.image_url);
  product.images.forEach((img) => addImg(img.url));
  product.variants.forEach((v) => addImg(v.image_url));

  const cartQty = items.find(
    (i) => i.slug === product.slug && i.variant === selectedVariant,
  )?.qty ?? 0;

  function handleAdd() {
    if (!isLoggedIn) { router.push("/login?next=/store"); return; }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price_vnd: product.price_vnd,
      image_url: allImages[0] ?? null,
      variant: selectedVariant,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {cartOpen && <CartSheet onClose={() => setCartOpen(false)} />}

      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-20 border-b px-4 py-3"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in srgb, var(--surface) 90%, transparent)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link
            href="/store"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition hover:opacity-70"
            style={{ color: "var(--green-deep)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại cửa hàng
          </Link>
          <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{product.name}</p>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)] transition hover:border-[var(--green)] hover:text-[var(--green)]"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--green)] text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:px-8">
        {/* Top section: carousel + buy box */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: carousel */}
          <div>
            {allImages.length > 0 ? (
              <ImageCarousel images={allImages} />
            ) : (
              /* Fallback emoji hero */
              <div
                className="flex aspect-square items-center justify-center rounded-[24px] border border-[var(--border)]"
                style={{ background: "var(--green-wash)" }}
              >
                <span className="text-[80px]">🌿</span>
              </div>
            )}
          </div>

          {/* Right: sticky buy box */}
          <div className="lg:sticky lg:top-[60px] lg:self-start">
            <div
              className="rounded-[22px] border p-5"
              style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
            >
              {/* Category */}
              {product.category && (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                  {CATEGORY_LABEL[product.category] ?? product.category}
                </p>
              )}

              {/* Name */}
              <h1 className="mt-1 font-serif text-[22px] font-semibold leading-snug text-[var(--foreground)]">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="mt-0.5 text-[13px] text-[var(--muted)]">{product.subtitle}</p>
              )}

              {/* Price */}
              <div className="mt-4">
                <span className="font-sans text-[30px] font-bold leading-none text-[var(--foreground)]">
                  {formatVnd(product.price_vnd)}
                </span>
              </div>

              {/* Stock */}
              <p className="mt-1.5 text-[12px]" style={{ color: product.in_stock ? "var(--green)" : "var(--muted)" }}>
                {!product.in_stock
                  ? "Hết hàng"
                  : product.stock_quantity > 0
                  ? `Còn ${product.stock_quantity} sản phẩm`
                  : "Còn hàng"}
              </p>

              {/* Variants */}
              {product.variants.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Phân loại
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const active = selectedVariant === v.name;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setSelectedVariant(v.name)}
                          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition"
                          style={{
                            borderColor: active ? "var(--green)" : "var(--border)",
                            background: active ? "var(--green-wash)" : "var(--surface-card)",
                            color: active ? "var(--green-deep)" : "var(--foreground)",
                          }}
                        >
                          {v.image_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={v.image_url} alt={v.name} className="h-5 w-5 rounded-full object-cover" />
                          )}
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] text-[var(--foreground)]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Add to cart */}
              <div className="mt-5">
                {isLoggedIn ? (
                  <button
                    type="button"
                    disabled={!product.in_stock}
                    onClick={handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: added ? "var(--green-deep)" : "var(--green)" }}
                  >
                    {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                    {!product.in_stock ? "Hết hàng" : added ? "Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--green)] py-3.5 text-[14px] font-semibold text-[var(--green)] transition hover:bg-[var(--green-wash)]"
                  >
                    <LogIn className="h-4 w-4" />
                    Đăng nhập để mua
                  </button>
                )}
                {cartQty > 0 && (
                  <p className="mt-2 text-center text-[12px] text-[var(--muted)]">
                    {cartQty} sản phẩm trong giỏ
                  </p>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                {["Giao hàng toàn quốc", "Đổi trả trong 7 ngày", "An toàn sức khỏe"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
                    <Check className="h-3.5 w-3.5 text-[var(--green)]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product info tabs */}
        {(product.description || product.ingredients || product.usage_guide ||
          product.safety_notes || product.storage_info || product.dimensions ||
          product.origin || product.manufacturer || product.expiry_months) && (
          <div className="mt-8 rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] p-6">
            <StoreProductTabs
              description={product.description ?? undefined}
              ingredients={product.ingredients ?? undefined}
              usageGuide={product.usage_guide ?? undefined}
              safetyNotes={product.safety_notes ?? undefined}
              storageInfo={product.storage_info ?? undefined}
              dimensions={product.dimensions ?? undefined}
              origin={product.origin ?? undefined}
              manufacturer={product.manufacturer ?? undefined}
              expiryMonths={product.expiry_months ?? undefined}
            />
          </div>
        )}

        {/* Manufacturer quick-info (if origin or manufacturer set) */}
        {(product.origin || product.manufacturer) && (
          <div
            className="mt-6 rounded-[22px] border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Thông tin sản phẩm
            </p>
            <div className="space-y-2 text-[13px] text-[var(--foreground)]">
              {product.manufacturer && (
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  <span>{product.manufacturer}</span>
                </div>
              )}
              {product.origin && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  <span>Xuất xứ: {product.origin}</span>
                </div>
              )}
              {product.expiry_months && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  <span>Hạn sử dụng: {product.expiry_months} tháng</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
