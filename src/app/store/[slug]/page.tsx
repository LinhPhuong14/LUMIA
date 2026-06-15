import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreProductTabs } from "@/components/store/store-product-tabs";
import { createClient } from "@/lib/supabase/server";

type Variant = { id: string; label: string; note?: string };

type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_vnd: number;
  category: string | null;
  features: string[] | null;
  image_url: string | null;
  in_stock: boolean;
  sort_order: number | null;
  stock_quantity: number;
  ingredients: string | null;
  usage_guide: string | null;
  safety_notes: string | null;
  storage_info: string | null;
  dimensions: string | null;
  origin: string | null;
  manufacturer: string | null;
  variants: Variant[] | null;
  expiry_months: number | null;
};

export default async function StoreProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: product } = await supabase
    .from("store_products")
    .select("*")
    .eq("slug", slug)
    .single<StoreProduct>();

  if (!product) notFound();

  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price_vnd);

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <main className="shell py-10">
        {/* Back link */}
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại cửa hàng
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Image */}
          {product.image_url && (
            <div className="soft-card overflow-hidden rounded-3xl p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
                style={{ maxHeight: 480 }}
              />
            </div>
          )}

          {/* Product info */}
          <div className={product.image_url ? "" : "lg:col-span-2"}>
            {product.category && (
              <span className="eyebrow">{product.category}</span>
            )}

            <h1 className="mt-2 font-serif text-4xl text-[var(--green-deep)]">{product.name}</h1>

            {product.subtitle && (
              <p className="mt-2 text-lg text-[var(--muted)]">{product.subtitle}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-[var(--green-wash)] px-4 py-1.5 text-lg font-semibold text-[var(--green-deep)]">
                {priceFormatted}
              </span>

              {product.stock_quantity > 0 ? (
                <span className="text-sm font-medium" style={{ color: "var(--green)" }}>
                  Còn {product.stock_quantity} sản phẩm
                </span>
              ) : (
                <span className="text-sm font-medium text-red-500">Hết hàng</span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm text-[var(--muted)]">Loại sản phẩm</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <span
                      key={v.id}
                      className={[
                        "rounded-full border px-4 py-1.5 text-sm",
                        i === 0
                          ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                          : "border-[var(--border)] text-[var(--foreground)]",
                      ].join(" ")}
                    >
                      {v.label}
                      {v.note && <span className="ml-1 text-[var(--muted)]">({v.note})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <ul className="mt-6 space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                    <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--green)]" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {/* Add to cart */}
            <div className="mt-8">
              <Link
                href="/store"
                className={[
                  "button-primary inline-flex items-center gap-2",
                  product.stock_quantity === 0 ? "pointer-events-none opacity-50" : "",
                ].join(" ")}
                aria-disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
      </main>
    </div>
  );
}
