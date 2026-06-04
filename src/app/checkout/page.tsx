import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug, lumiaProducts } from "@/data/catalog";
import { getSession } from "@/lib/auth";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const product = getProductBySlug(params.product ?? "") ?? lumiaProducts[1];
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell grid gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <section className="space-y-6">
          <span className="eyebrow">Hoàn tất lựa chọn</span>
          <h1 className="font-serif text-5xl leading-tight text-matcha-deep">
            Một bước cuối cùng để mang LUMIA về với buổi tối của bạn.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Chúng tôi giữ trải nghiệm thanh toán gọn gàng và riêng tư, để bạn chỉ cần tập trung vào điều quan trọng nhất:
            cảm giác mình sắp được chăm sóc.
          </p>

          <div className="liquid-glass overflow-hidden rounded-[36px] bg-white/72 p-4 shadow-[0_24px_80px_rgba(244,216,120,0.16)]">
            <Image
              src="/assets/checkout-soft-glow.svg"
              alt="Khung cảnh dịu sáng cho bước hoàn tất lựa chọn"
              width={1200}
              height={900}
              className="h-[24rem] w-full rounded-[28px] object-cover"
              priority
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="soft-card p-5">
              <h2 className="font-semibold text-matcha-deep">Nhẹ nhàng và rõ ràng</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Từng bước được trình bày tối giản để bạn đi tiếp mà không bị nhiễu bởi quá nhiều thông tin.
              </p>
            </div>
            <div className="soft-card p-5">
              <h2 className="font-semibold text-matcha-deep">Kích hoạt liền mạch</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Sau khi hoàn tất, không gian của bạn sẽ sẵn sàng để bắt đầu hành trình tối nay một cách trọn vẹn.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="soft-card p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Hộp bạn đã chọn</div>
              <div className="mt-3 font-serif text-3xl text-matcha-deep">{product.name}</div>
              <p className="mt-3 text-sm leading-6 text-muted">{product.tagline}</p>
            </div>
            <div className="soft-card p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Quyền truy cập</div>
              <p className="mt-3 text-sm leading-6 text-matcha-deep">{product.digitalAccess}</p>
            </div>
            <div className="soft-card p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Nhịp đồng hành</div>
              <p className="mt-3 text-sm leading-6 text-matcha-deep">
                {product.durationMonths} tháng để bạn ghi nhận cảm xúc, viết ra điều đang nặng và mở LUMIA lắng nghe khi cần.
              </p>
            </div>
          </div>

          {!session ? (
            <div className="soft-card p-6">
              <h3 className="font-serif text-2xl text-matcha-deep">Đăng nhập trước khi tiếp tục</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Việc này giúp LUMIA chuẩn bị đúng không gian, nội dung và quyền truy cập dành riêng cho bạn ngay sau khi hoàn tất.
              </p>
              <div className="mt-5 flex gap-3">
                <Link href={`/login?next=/checkout?product=${product.slug}` as Route} className="button-primary">
                  Đăng nhập
                </Link>
                <Link href={`/register?next=/checkout?product=${product.slug}` as Route} className="button-secondary">
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
