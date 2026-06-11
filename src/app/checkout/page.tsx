import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug } from "@/data/catalog";
import { getSession } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const product = getProductBySlug(params.slug ?? "first-time-user");

  if (!product) {
    redirect("/boxes");
  }

  return (
    <div className="marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="shell grid gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <section className="space-y-6">
          <span className="eyebrow">Hoàn tất lựa chọn</span>
          <h1 className="font-serif text-5xl leading-tight text-matcha-deep">
            Một bước cuối cùng để mang LUMIA về với buổi tối của bạn.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Thanh toán qua PayOS — an toàn và riêng tư.
          </p>
          <div className="liquid-glass overflow-hidden rounded-[36px] bg-white/72 p-4">
            <Image
              src="/assets/checkout-soft-glow.svg"
              alt="Checkout"
              width={1200}
              height={900}
              className="h-[24rem] w-full rounded-[28px] object-cover"
              priority
            />
          </div>
          {!session ? (
            <div className="soft-card p-6">
              <h3 className="font-serif text-2xl text-matcha-deep">Đăng nhập trước khi tiếp tục</h3>
              <div className="mt-5 flex gap-3">
                <Link href={"/login?next=/checkout" as Route} className="button-primary">
                  Đăng nhập
                </Link>
                <Link href={"/register?next=/checkout" as Route} className="button-secondary">
                  Tạo tài khoản
                </Link>
              </div>
            </div>
          ) : null}
        </section>
        {session ? <CheckoutPanel product={product} /> : null}
      </main>
    </div>
  );
}
