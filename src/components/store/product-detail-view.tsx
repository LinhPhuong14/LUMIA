"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowLeft, Check, ChevronDown, Phone, MapPin, ShoppingCart, Package, LogIn } from "lucide-react";

import type { StoreProductDetail } from "@/data/store-products-detail";
import { SPRAY_PRODUCT_SLUGS } from "@/data/store-products-detail";
import { useCart } from "@/lib/cart-context";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function Section({ title, items, text }: { title: string; items?: string[]; text?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{
            color: "var(--muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div className="pb-4">
          {text && (
            <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {text}
            </p>
          )}
          {items && (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Spray product variant selector
const SPRAY_VARIANTS = [
  { slug: "xit-oai-huong", label: "Oải Hương", emoji: "🌿", color: "#c5a8d8" },
  { slug: "xit-tra-trang", label: "Trà Trắng", emoji: "🍵", color: "#a0d090" },
  { slug: "xit-bach-dan-chanh", label: "Bạch Đàn Chanh", emoji: "🌿", color: "#bce8b0" },
  { slug: "xit-hoa-lai", label: "Hoa Lài", emoji: "🌸", color: "#f0c0e0" },
];

export function ProductDetailView({
  product,
  backHref,
  inDashboard = false,
  isLoggedIn = true,
}: {
  product: StoreProductDetail;
  backHref: string;
  inDashboard?: boolean;
  isLoggedIn?: boolean;
}) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const isSpray = SPRAY_PRODUCT_SLUGS.includes(product.slug);

  function handleAdd() {
    if (!isLoggedIn) {
      router.push("/login?next=/store");
      return;
    }
    addItem({
      id: product.slug,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price_vnd: product.price_vnd,
      image_url: null,
      variant: null,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const cartQty = items.find((i) => i.slug === product.slug)?.qty ?? 0;

  return (
    <div>
      {/* Back link — sticky bar on marketing page only */}
      {!inDashboard && (
        <div className="sticky top-0 z-20 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 90%, transparent)", backdropFilter: "blur(20px)" }}>
          <Link
            href={backHref as Route}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition hover:opacity-70"
            style={{ color: "var(--green-deep)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại cửa hàng
          </Link>
        </div>
      )}

      <div className={`mx-auto max-w-3xl px-4 pt-6 lg:px-8 ${inDashboard ? "pb-8" : "pb-24"}`}>
        {/* Pill back button inside dashboard */}
        {inDashboard && (
          <Link href={backHref as Route} className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Cửa hàng
          </Link>
        )}
        {/* Hero */}
        <div
          className="relative mb-6 overflow-hidden rounded-[28px] p-8 sm:p-12"
          style={{ background: product.color }}
        >
          <div className="absolute inset-0 hidden dark:block" style={{ background: "linear-gradient(135deg,rgba(8,14,10,0.55) 0%,rgba(14,22,12,0.45) 100%)" }} />
          <div className="relative z-10 flex items-center gap-6">
            <span className="text-7xl drop-shadow-sm">{product.emoji}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--green)" }}>
                Lumia Store
              </p>
              <h1 className="mt-1 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]" style={{ color: "var(--foreground)" }}>
                {product.name}
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
                {product.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Spray variant picker */}
        {isSpray && (
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
              Chọn mùi hương
            </p>
            <div className="flex flex-wrap gap-2">
              {SPRAY_VARIANTS.map((v) => {
                const href = inDashboard ? `/dashboard/store/products/${v.slug}` : `/store/products/${v.slug}`;
                const isActive = v.slug === product.slug;
                return (
                  <Link
                    key={v.slug}
                    href={href as Route}
                    className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition"
                    style={{
                      borderColor: isActive ? "var(--green)" : "var(--border)",
                      background: isActive ? "var(--green-wash)" : "var(--surface-card)",
                      color: isActive ? "var(--green-deep)" : "var(--foreground)",
                    }}
                  >
                    <span>{v.emoji}</span>
                    {v.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Left – details */}
          <div>
            {/* Tagline */}
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {product.tagline}
            </p>

            {/* Badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-semibold"
                  style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
                >
                  <Check className="h-3 w-3" />
                  {b}
                </span>
              ))}
            </div>

            {/* Scent description */}
            {product.scent_description && (
              <div
                className="mb-6 rounded-[16px] border-l-4 p-4"
                style={{
                  borderLeftColor: "var(--green)",
                  background: "var(--green-wash)",
                }}
              >
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--green-deep)" }}>
                  {product.scent_description}
                </p>
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-6 rounded-[16px] border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
                Thành phần
              </p>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                {product.ingredients}
              </p>
            </div>

            {/* Accordion sections */}
            <div className="rounded-[16px] border px-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              {product.sections.map((s) => (
                <Section key={s.title} title={s.title} items={s.items} text={s.text} />
              ))}
            </div>

            {/* Manufacturer */}
            <div
              className="mt-6 rounded-[16px] border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
            >
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
                Thông tin sản phẩm
              </p>
              <div className="space-y-2 text-[13px]" style={{ color: "var(--foreground)" }}>
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  <span><strong>{product.manufacturer.company}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                  <span>{product.manufacturer.address}</span>
                </div>
                {product.manufacturer.hotline && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                    <span>{product.manufacturer.hotline}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)]">Xuất xứ:</span>
                  <span>{product.manufacturer.origin}</span>
                </div>
                {product.manufacturer.producer && (
                  <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[var(--muted)]">Sản xuất tại: <span style={{ color: "var(--foreground)" }}>{product.manufacturer.producer}</span></p>
                    {product.manufacturer.producer_address && (
                      <p className="text-[var(--muted)]">{product.manufacturer.producer_address}</p>
                    )}
                  </div>
                )}
                {(product.manufacturer.mfg || product.manufacturer.exp || product.manufacturer.standard) && (
                  <div className="mt-2 border-t pt-2 text-[12px] text-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                    {product.manufacturer.standard && <p>{product.manufacturer.standard}</p>}
                    {product.manufacturer.mfg && <p>NSX: {product.manufacturer.mfg}</p>}
                    {product.manufacturer.exp && <p>HSD: {product.manufacturer.exp}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right – buy box (sticky on desktop) */}
          <div className="lg:sticky lg:top-[64px] lg:self-start">
            <div
              className="rounded-[20px] border p-5"
              style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
            >
              <div className="mb-4">
                <p className="font-sans text-[32px] font-bold leading-none" style={{ color: "var(--foreground)" }}>
                  {formatVnd(product.price_vnd)}
                </p>
                {product.volume && (
                  <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
                    {product.volume}
                  </p>
                )}
                {product.weight && (
                  <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
                    {product.weight}
                  </p>
                )}
              </div>

              {!isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--green)] py-3.5 text-[14px] font-semibold text-[var(--green)] transition hover:bg-[var(--green-wash)]"
                >
                  <LogIn className="h-4 w-4" /> Đăng nhập để mua
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90"
                  style={{ background: added ? "var(--green-deep)" : "var(--green)" }}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ hàng
                    </>
                  )}
                </button>
              )}

              {cartQty > 0 && (
                <p className="mt-2 text-center text-[12px]" style={{ color: "var(--muted)" }}>
                  {cartQty} sản phẩm trong giỏ
                </p>
              )}

              <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                {["Giao hàng toàn quốc", "Đổi trả trong 7 ngày", "An toàn sức khỏe"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--muted)" }}>
                    <Check className="h-3.5 w-3.5 text-[var(--green)]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
