import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { getProductBySlug } from "@/data/catalog";
import { getSession } from "@/lib/supabase/auth";

const steps = ["Chọn gói", "Thanh toán", "Xong"] as const;

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
    <main className="shell py-8 md:py-12">
      <nav className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm" aria-label="Tiến trình thanh toán">
        {steps.map((step, index) => (
          <span key={step} className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 font-medium"
              style={{
                background: index <= 1 ? "var(--green-wash)" : "var(--glass-control)",
                color: "var(--green-deep)",
              }}
            >
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span style={{ color: "var(--muted)" }} aria-hidden>
                →
              </span>
            ) : null}
          </span>
        ))}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <section className="space-y-6">
          <span className="eyebrow">Hoàn tất lựa chọn</span>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl" style={{ color: "var(--green-deep)" }}>
            Một bước cuối cùng để mang LUMIA về với buổi tối của bạn.
          </h1>
          <p className="max-w-2xl text-lg leading-8" style={{ color: "var(--muted)" }}>
            Thanh toán qua PayOS — an toàn và riêng tư.
          </p>
          <div className="dash-panel overflow-hidden p-4">
            <Image
              src="/assets/checkout-soft-glow.svg"
              alt="Checkout"
              width={1200}
              height={900}
              className="h-[20rem] w-full rounded-[28px] object-cover md:h-[24rem]"
              priority
            />
          </div>
          {!session ? (
            <div className="dash-panel p-6">
              <h3 className="font-serif text-2xl" style={{ color: "var(--green-deep)" }}>
                Đăng nhập trước khi tiếp tục
              </h3>
              <div className="mt-5 flex flex-wrap gap-3">
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
        {session ? (
          <div className="dash-panel p-5 md:p-6">
            <CheckoutPanel product={product} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
