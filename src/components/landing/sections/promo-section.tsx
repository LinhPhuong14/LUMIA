import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type PromoPlan = {
  id: string;
  name: string;
  description: string | null;
  price_vnd: number;
  duration_months: number | null;
  features: string[] | null;
  box_image_url: string | null;
};

async function getFirstTimePlan(): Promise<PromoPlan | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("subscription_plans")
    .select("id,name,description,price_vnd,duration_months,features,box_image_url")
    .eq("is_active", true)
    .in("group", ["promo"])
    .order("price_vnd", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) {
    // fallback: fetch any plan with id containing 'first'
    const { data: fallback } = await supabase
      .from("subscription_plans")
      .select("id,name,description,price_vnd,duration_months,features,box_image_url")
      .eq("is_active", true)
      .ilike("id", "%first%")
      .limit(1)
      .maybeSingle();
    return fallback ?? null;
  }
  return data;
}

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export async function PromoSection() {
  const plan = await getFirstTimePlan();
  if (!plan) return null;

  const features: string[] = plan.features ?? [];

  return (
    <section className="px-4 py-16 sm:py-24" style={{ background: "var(--green-wash)" }}>
      <div className="shell">
        <div className="mx-auto max-w-3xl">
          {/* Kicker */}
          <div className="mb-6 flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--green-deep)]" />
            <p className="lumia-kicker !text-[var(--green-deep)]">— Dành riêng cho bạn mới</p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[var(--green)]/20 bg-[var(--surface-card)] shadow-[0_24px_80px_rgba(95,111,82,0.14)]">
            <div className="grid md:grid-cols-[1fr_280px]">
              {/* Left: info */}
              <div className="flex flex-col justify-between p-7 sm:p-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--green)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green-deep)]">
                    <Sparkles className="h-3 w-3" />
                    Ưu đãi đặc biệt
                  </div>
                  <h2 className="mt-4 font-serif text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[32px]">
                    {plan.name}
                  </h2>
                  {plan.description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{plan.description}</p>
                  )}

                  {features.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--foreground)]">
                          <span className="mt-0.5 text-[var(--green)]">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Chỉ từ</p>
                    <p className="font-sans text-[34px] font-bold leading-none text-[var(--foreground)]">
                      {formatVnd(plan.price_vnd)}
                    </p>
                    {plan.duration_months && (
                      <p className="mt-1 text-[12px] text-[var(--muted)]">cho {plan.duration_months} tháng đầu</p>
                    )}
                  </div>
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 hover:shadow-[0_8px_24px_rgba(95,111,82,0.35)]"
                  >
                    Đăng ký ngay <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right: image */}
              {plan.box_image_url && (
                <div className="hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plan.box_image_url}
                    alt={plan.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {!plan.box_image_url && (
                <div className="hidden items-center justify-center bg-[var(--green-wash)] md:flex">
                  <span className="text-[80px]">🎁</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
