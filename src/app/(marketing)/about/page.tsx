import type { Metadata } from "next";
import { Heart, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Về chúng tôi | Lumia",
  description: "Lumia — Thấu hiểu giấc ngủ. Nuôi dưỡng hạnh phúc.",
};

const values = [
  {
    icon: Heart,
    title: "Thấu hiểu",
    description: "Lắng nghe và đồng cảm với từng trạng thái cảm xúc",
  },
  {
    icon: Zap,
    title: "Tiện lợi",
    description: "Giải pháp đơn giản, dễ dùng, phù hợp cuộc sống hiện đại",
  },
  {
    icon: Shield,
    title: "Trách nhiệm",
    description: "Cam kết bảo vệ dữ liệu và sức khỏe người dùng",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 py-24 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--green-deep) 0%, var(--surface) 60%)",
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--green)" }}
          >
            Về chúng tôi
          </p>
          <h1
            className="font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ color: "var(--foreground)" }}
          >
            Lumia — Thấu hiểu giấc ngủ.{" "}
            <span style={{ color: "var(--green)" }}>Nuôi dưỡng hạnh phúc.</span>
          </h1>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="shell py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-[24px] border p-8"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-card)",
            }}
          >
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--green)" }}
            >
              Sứ mệnh
            </p>
            <h2
              className="mb-4 font-serif text-2xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Vì sao Lumia ra đời?
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Lumia được tạo ra để giúp mọi người hiểu sâu hơn về giấc ngủ và sức khỏe tinh thần. Chúng tôi tin rằng một giấc ngủ tốt là nền tảng của cuộc sống hạnh phúc.
            </p>
          </div>

          <div
            className="rounded-[24px] border p-8"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-card)",
            }}
          >
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--green)" }}
            >
              Tầm nhìn
            </p>
            <h2
              className="mb-4 font-serif text-2xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Chúng tôi hướng đến điều gì?
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Trở thành người bạn đồng hành đáng tin cậy trong hành trình chăm sóc giấc ngủ và sức khỏe tinh thần của mọi người.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="shell pb-20">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--green)" }}
          >
            Giá trị cốt lõi
          </p>
          <h2
            className="font-serif text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Những điều chúng tôi tin tưởng
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-[24px] border p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-card)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--green)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "var(--green-wash)" }}
              >
                <Icon className="h-6 w-6" style={{ color: "var(--green-deep)" }} />
              </div>
              <h3
                className="mb-2 font-serif text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Quote */}
      <section
        className="px-4 py-20 text-center"
        style={{ background: "var(--green-wash)" }}
      >
        <div className="mx-auto max-w-3xl">
          <blockquote
            className="font-serif text-2xl font-medium italic leading-relaxed md:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            "Mỗi giấc ngủ là một cơ hội để cơ thể hồi phục và tâm trí được nghỉ ngơi."
          </blockquote>
          <p
            className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--green-deep)" }}
          >
            — Lumia
          </p>
        </div>
      </section>
    </main>
  );
}
