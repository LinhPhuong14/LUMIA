import Link from "next/link";

import { PricingCatalog } from "@/components/marketing/pricing-catalog";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

const catalogFeatures = [
  "AI Sleep",
  "Mood Tracking",
  "Guided Meditation",
  "Breathing Exercise",
  "Journal & Reflect",
  "Sleep Sounds",
];

export default async function BoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";
  const firstTimeUnavailable = session ? await hasUserBoughtFirstTime(session.id) : false;

  return (
    <div className="catalog-page">
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-7 md:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium" style={{ color: "var(--green)" }}>
            Hệ sinh thái công nghệ chăm sóc giấc ngủ
          </p>
          <h1
            className="mt-3 font-serif text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl"
            style={{ color: "var(--title-primary)" }}
          >
            Gói Thành Viên LUMIA
          </h1>
          <p className="mx-auto mt-1 text-sm font-medium" style={{ color: "var(--muted)" }}>
            LUMIA Subscriptions
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 md:text-lg" style={{ color: "var(--muted)" }}>
            Chọn gói phù hợp với nhịp sống của bạn — từ trải nghiệm số thuần túy đến combo đa giác quan với đặc
            quyền vật lý.
          </p>
        </section>

        {onboarding ? (
          <section className="dash-panel mx-auto mt-8 max-w-3xl p-5">
            <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
              Dựa trên kết quả khảo sát, đây là gói LUMIA phù hợp nhất với dữ liệu tâm lý của bạn.
            </p>
          </section>
        ) : null}

        <PricingCatalog firstTimeUnavailable={firstTimeUnavailable} />
      </main>

      <section className="catalog-footer-strip mt-12 px-4 py-8 md:px-7">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm md:text-left" style={{ color: "var(--muted)" }}>
            {catalogFeatures.join(" · ")}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            lumia.vn
          </p>
        </div>
      </section>
    </div>
  );
}
