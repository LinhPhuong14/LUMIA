import { SiteHeader } from "@/components/marketing/site-header";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Route } from "next";

type Product = {
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
  stock_quantity: number;
};

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export default async function StorePage() {
  const supabase = await createClient();
  const products: Product[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("store_products")
      .select("id,slug,name,subtitle,description,price_vnd,category,features,image_url,in_stock,stock_quantity")
      .eq("is_active", true)
      .order("sort_order");
    if (data) products.push(...(data as Product[]));
  }

  return (
    <div className="marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="shell py-14">
        <div className="mb-10">
          <span className="eyebrow">Cửa hàng</span>
          <h1 className="mt-4 font-serif text-5xl text-matcha-deep">Sản phẩm LUMIA</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
            Những sản phẩm chăm sóc giấc ngủ và tinh thần — được chọn lọc kỹ lưỡng để đồng hành cùng bạn mỗi ngày.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-muted">Đang cập nhật sản phẩm…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.slug}` as Route}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(95,111,82,0.07)] transition hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)] hover:-translate-y-0.5"
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--green-wash)]">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-30">🌿</span>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--green)] px-3 py-1 text-[11px] font-bold text-white shadow">
                    {formatVnd(p.price_vnd)}
                  </span>
                  {!p.in_stock && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">
                      Hết hàng
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-[18px] font-semibold text-[var(--foreground)]">{p.name}</h3>
                  {p.subtitle && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{p.subtitle}</p>}
                  {p.stock_quantity > 0 && p.in_stock && (
                    <p className="mt-2 text-[12px] text-[var(--green-deep)]">Còn {p.stock_quantity} sản phẩm</p>
                  )}
                  <ul className="mt-3 flex-1 space-y-1">
                    {(p.features ?? []).slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex-1 rounded-full bg-[var(--green)] py-2.5 text-center text-[13px] font-semibold text-white transition group-hover:opacity-90">
                      {p.in_stock ? "Xem chi tiết" : "Hết hàng"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
