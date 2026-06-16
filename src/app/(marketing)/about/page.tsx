import type { Metadata } from "next";
import { Heart, Lightbulb, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Về chúng tôi | LUMIA",
  description:
    "Lumia — Hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ, theo dõi cảm xúc, phân tích dữ liệu và AI lắng nghe.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Thấu hiểu",
    desc: "Lắng nghe và đồng cảm với từng trạng thái cảm xúc, không phán xét, không áp lực.",
  },
  {
    icon: Lightbulb,
    title: "Tiện lợi",
    desc: "Giải pháp đơn giản, dễ dùng, phù hợp với cuộc sống hiện đại — mọi lúc, mọi nơi.",
  },
  {
    icon: Shield,
    title: "Trách nhiệm",
    desc: "Cam kết bảo vệ dữ liệu cá nhân và đặt sức khỏe người dùng lên hàng đầu.",
  },
];

export default function AboutPage() {
  return (
    <main className="pb-24">
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[420px] items-center overflow-hidden px-6 py-20 sm:min-h-[500px] sm:px-10"
        style={{
          background:
            "linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--green-wash) 60%, var(--surface)) 100%)",
        }}
      >
        {/* Decorative circle */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--green) 0%, transparent 70%)" }}
        />
        <div className="shell relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--green)]">
            Về chúng tôi
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-[36px] font-semibold leading-tight text-[var(--foreground)] sm:text-[52px]">
            Lumia — Thấu hiểu giấc ngủ.{" "}
            <span style={{ color: "var(--green-deep)" }}>Nuôi dưỡng hạnh phúc.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            Chúng tôi xây dựng Lumia vì tin rằng một giấc ngủ tốt là nền tảng của cuộc sống hạnh
            phúc — và mỗi người xứng đáng được chăm sóc sức khỏe tinh thần đúng cách.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="section-pad">
        <div className="shell">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Mission */}
            <div
              className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                Sứ mệnh
              </p>
              <h2 className="mt-2 font-serif text-[22px] font-semibold leading-snug text-[var(--foreground)]">
                Đồng hành trên hành trình chăm sóc bản thân
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
                Lumia được tạo ra để giúp mọi người hiểu sâu hơn về giấc ngủ và sức khỏe tinh
                thần. Thông qua công nghệ AI và dữ liệu cá nhân hóa, chúng tôi cung cấp những
                công cụ thực tế để bạn cải thiện từng ngày.
              </p>
            </div>

            {/* Vision */}
            <div
              className="rounded-[24px] border border-[var(--green)]/30 p-8"
              style={{ background: "var(--green-wash)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                Tầm nhìn
              </p>
              <h2 className="mt-2 font-serif text-[22px] font-semibold leading-snug text-[var(--green-deep)]">
                Người bạn đồng hành đáng tin cậy
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
                Trở thành nền tảng chăm sóc giấc ngủ và sức khỏe tinh thần hàng đầu — nơi mỗi
                người tìm được sự thấu hiểu, cân bằng và hạnh phúc thực sự trong cuộc sống.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="section-pad" style={{ background: "var(--surface-warm, var(--surface))" }}>
        <div className="shell">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
              Giá trị cốt lõi
            </p>
            <h2 className="mt-2 font-serif text-[28px] font-semibold text-[var(--foreground)] sm:text-[34px]">
              Lumia tin vào điều gì?
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex flex-col items-start gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--green)]/40 hover:shadow-[0_16px_40px_rgba(95,111,82,0.14)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-wash)] transition-colors group-hover:bg-[var(--green)]/15">
                  <Icon className="h-5 w-5 text-[var(--green)]" />
                </div>
                <div>
                  <h3 className="font-serif text-[18px] font-semibold text-[var(--foreground)]">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Quote ── */}
      <section className="section-pad">
        <div className="shell">
          <div
            className="relative overflow-hidden rounded-[28px] px-8 py-14 text-center sm:px-16 sm:py-20"
            style={{
              background:
                "linear-gradient(135deg, var(--green-wash) 0%, color-mix(in srgb, var(--green-wash) 50%, var(--surface)) 100%)",
              border: "1px solid color-mix(in srgb, var(--green) 25%, transparent)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, var(--green) 0%, transparent 60%), radial-gradient(circle at 80% 50%, var(--green-deep) 0%, transparent 60%)",
              }}
            />
            <p className="relative z-10 font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--green)]">
              Triết lý của chúng tôi
            </p>
            <blockquote className="relative z-10 mx-auto mt-5 max-w-2xl font-serif text-[22px] font-medium italic leading-relaxed text-[var(--foreground)] sm:text-[28px]">
              "Mỗi giấc ngủ là một cơ hội để cơ thể hồi phục và tâm trí được nghỉ ngơi."
            </blockquote>
            <p className="relative z-10 mt-5 text-[13px] text-[var(--muted)]">— Đội ngũ LUMIA</p>
          </div>
        </div>
      </section>

      {/* ── Team CTA ── */}
      <section className="section-pad">
        <div className="shell text-center">
          <h2 className="font-serif text-[24px] font-semibold text-[var(--foreground)]">
            Cùng bắt đầu hành trình với Lumia
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-[var(--muted)]">
            Tham gia cộng đồng hàng nghìn người đang cải thiện giấc ngủ và sức khỏe tinh thần mỗi ngày.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-7 py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 hover:shadow-[0_8px_24px_rgba(95,111,82,0.4)]"
            >
              Đăng ký miễn phí
            </a>
            <a
              href="mailto:lumiavn@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-7 py-3.5 text-[14px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]/50"
            >
              Liên hệ chúng tôi
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
