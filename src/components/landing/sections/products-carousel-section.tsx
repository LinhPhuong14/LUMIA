import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type CarouselProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price_vnd: number;
  image_url: string | null;
  category: string;
};

async function getCarouselProducts(): Promise<CarouselProduct[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("store_products")
    .select("id,slug,name,subtitle,price_vnd,image_url,category")
    .eq("is_active", true)
    .order("sort_order")
    .limit(8);
  return data ?? [];
}

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export async function ProductsCarouselSection() {
  const products = await getCarouselProducts();
  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24" style={{ background: "var(--surface-card)" }}>
      <div className="shell mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="lumia-kicker">— Cửa hàng LUMIA</p>
            <h2 className="lumia-h2 mt-2">Sản phẩm nổi bật.</h2>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
              Công cụ vật lý hỗ trợ giấc ngủ và sức khỏe tinh thần, chọn lọc kỹ càng.
            </p>
          </div>
          <Link
            href="/store"
            className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--green)] hover:underline underline-offset-2"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${product.slug}`}
              className="group flex w-[220px] sm:w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.09)]"
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden bg-[var(--green-wash)]">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-[var(--green)]/40" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-[var(--surface-card)]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--green-deep)] backdrop-blur-sm">
                  {product.category}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-serif text-[15px] font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--green-deep)] transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.subtitle && (
                  <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--muted)]">
                    {product.subtitle}
                  </p>
                )}
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-sans text-[16px] font-bold text-[var(--foreground)]">
                    {formatVnd(product.price_vnd)}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--green)]">
                    Xem <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
