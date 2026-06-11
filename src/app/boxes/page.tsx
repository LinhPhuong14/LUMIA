import Link from "next/link";

import { ProductCard } from "@/components/marketing/product-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { lumiaBox } from "@/data/catalog";
import { getSession } from "@/lib/supabase/auth";

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
            Hộp LUMIA
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#6f6b63]">
            Một hộp duy nhất — 21 ngày đồng hành cùng giấc ngủ và thiền định.
          </p>
        </section>

        {onboarding ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_50px_rgba(106,134,88,0.08)] backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href={`/boxes/${lumiaBox.slug}`}
                className="rounded-[24px] bg-[#2f2f2f] px-6 py-5 text-left text-white transition hover:bg-[#242424]"
              >
                <div className="text-sm font-medium">Mua hộp LUMIA</div>
                <div className="mt-2 text-sm text-white/70">Mở khóa hành trình 21 ngày đầy đủ.</div>
              </Link>
              <Link
                href={session ? "/dashboard" : "/register?next=/onboarding"}
                className="rounded-[24px] border border-[#ebe3d2] bg-[#fbf7ef] px-6 py-5 text-left text-[#2f2b25] transition hover:bg-white"
              >
                <div className="text-sm font-medium">Dùng thử miễn phí trước</div>
                <div className="mt-2 text-sm text-[#6f6b63]">Vào workspace ngay, rồi nâng cấp sau.</div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-14 max-w-xl">
          <ProductCard product={lumiaBox} featured />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
