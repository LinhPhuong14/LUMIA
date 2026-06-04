import Link from "next/link";

import { ProductCard } from "@/components/marketing/product-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { lumiaProducts } from "@/data/catalog";
import { getSession } from "@/lib/auth";

export default async function BoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";

  return (
    <div className="min-h-screen bg-[#f8f4eb]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-7 py-12">
        <section className="mx-auto max-w-4xl text-center">
          <div className="font-serif text-[4.6rem] leading-[0.95] tracking-[-0.06em] text-[#2f2b25] md:text-[5.6rem]">
            Gentle essentials
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#6f6b63]">
            Chọn chiếc hộp phù hợp để bắt đầu ritual của riêng bạn, hoặc vào workspace miễn phí trước nếu bạn muốn cảm nhận nhẹ hơn.
          </p>
        </section>

        {onboarding ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_50px_rgba(106,134,88,0.08)] backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/boxes"
                className="rounded-[24px] bg-[#2f2f2f] px-6 py-5 text-left text-white transition hover:bg-[#242424]"
              >
                <div className="text-sm font-medium">Mở premium bằng một box</div>
                <div className="mt-2 text-sm text-white/70">Chọn hộp phù hợp để mở đầy đủ trải nghiệm LUMIA.</div>
              </Link>

              <Link
                href={session ? "/dashboard" : "/register?next=/dashboard"}
                className="rounded-[24px] border border-[#ebe3d2] bg-[#fbf7ef] px-6 py-5 text-left text-[#2f2b25] transition hover:bg-white"
              >
                <div className="text-sm font-medium">Dùng thử miễn phí trước</div>
                <div className="mt-2 text-sm text-[#6f6b63]">Vào workspace ngay, rồi nâng cấp sau khi bạn đã sẵn sàng.</div>
              </Link>
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-10 max-w-xl rounded-full border border-white/70 bg-white/82 p-2 shadow-[0_18px_50px_rgba(106,134,88,0.06)]">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={session ? "/dashboard" : "/register?next=/dashboard"}
                className="rounded-full px-6 py-3 text-center text-sm font-medium text-[#6f6b63] transition hover:bg-[#faf7ef]"
              >
                Dùng thử miễn phí
              </Link>
              <div className="rounded-full bg-[#2f2f2f] px-6 py-3 text-center text-sm font-medium text-white">
                Chọn một box
              </div>
            </div>
          </section>
        )}

        <section className="mt-14 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {lumiaProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} featured={index === 2} />
          ))}
        </section>

        <section className="mx-auto mt-12 max-w-5xl rounded-[36px] border border-white/70 bg-white/78 p-8 shadow-[0_20px_60px_rgba(180,154,67,0.08)]">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="font-serif text-3xl text-[#2f2b25]">Tạo tài khoản</div>
              <p className="mt-3 text-sm leading-7 text-[#6f6b63]">Giữ chỗ cho không gian riêng của bạn trước khi bắt đầu hành trình.</p>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#2f2b25]">Chọn box</div>
              <p className="mt-3 text-sm leading-7 text-[#6f6b63]">Mỗi hộp mở một mức trải nghiệm digital khác nhau, từ nhẹ đến sâu hơn.</p>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#2f2b25]">Hoặc dùng thử</div>
              <p className="mt-3 text-sm leading-7 text-[#6f6b63]">Nếu chưa sẵn sàng mua ngay, bạn vẫn có thể vào workspace miễn phí trước.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
