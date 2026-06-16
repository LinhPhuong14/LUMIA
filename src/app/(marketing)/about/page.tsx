import type { Metadata } from "next";
import { Heart, Zap, Shield, Target, Rocket, Mail, Globe, MapPin, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Về chúng tôi | Lumia",
  description: "Lumia - Hệ sinh thái công nghệ hướng đến việc cải thiện giấc ngủ và sức khỏe tinh thần.",
};

const VALUES = [
  {
    en: "Empathy",
    vi: "Thấu hiểu",
    icon: Heart,
    color: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
    iconColor: "text-rose-500",
    desc: "LUMIA đặt người tiêu dùng làm trọng tâm của mọi hoạt động nghiên cứu và phát triển, thấu hiểu sâu sắc những áp lực tinh thần mà người trẻ đô thị đang đối mặt. Nền tảng được thiết kế để hiểu các trạng thái tinh thần khác nhau, cung cấp sự hỗ trợ nhẹ nhàng mà không phán xét.",
  },
  {
    en: "Convenience",
    vi: "Tiện lợi",
    icon: Zap,
    color: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
    iconColor: "text-amber-500",
    desc: "Lumia giúp người dùng dễ dàng tiếp cận các dịch vụ hỗ trợ giấc ngủ và sức khỏe tinh thần thông qua nền tảng kỹ thuật số có thể tích hợp vào thói quen hàng ngày. Trải nghiệm được thiết kế đơn giản, trực quan và thiết thực.",
  },
  {
    en: "Responsibility",
    vi: "Trách nhiệm",
    icon: Shield,
    color: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
    iconColor: "text-emerald-600",
    desc: "Lumia ưu tiên quyền riêng tư của người dùng, tương tác AI có đạo đức, giao tiếp minh bạch và phát triển sản phẩm an toàn. Nền tảng tránh các cơ chế tương tác có hại và tập trung vào việc hỗ trợ các thói quen lành mạnh hơn.",
  },
];

export default function AboutPage() {
  return (
    <main className="pb-0">

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--green) 18%, transparent), transparent)",
          }}
        />
        <div className="shell relative z-10 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--green)" }}>
            Về chúng tôi
          </p>
          <h1
            className="mt-3 font-serif text-[38px] font-semibold leading-tight sm:text-[52px]"
            style={{ color: "var(--foreground)" }}
          >
            Lumia là hệ sinh thái công nghệ hướng đến việc cải thiện{" "}
            <span style={{ color: "var(--green-deep)" }}>giấc ngủ</span> và{" "}
            <span style={{ color: "var(--green-deep)" }}>sức khỏe tinh thần</span>.
          </h1>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.8]" style={{ color: "var(--muted)" }}>
            <p>
              Chúng tôi phát triển các giải pháp kết hợp giữa trí tuệ nhân tạo, dữ liệu hành vi và các
              phương pháp chăm sóc sức khỏe hiện đại nhằm giúp người dùng hiểu rõ hơn về cơ thể, cảm
              xúc và nhu cầu nghỉ ngơi của chính mình.
            </p>
            <p>
              Tại Lumia, chúng tôi tin rằng sức khỏe tinh thần không chỉ là việc giải quyết những áp lực
              trong cuộc sống, mà còn là khả năng lắng nghe cơ thể, quản lý cảm xúc và duy trì những thói
              quen tích cực. Từ đó, Lumia mong muốn trở thành người bạn đồng hành đáng tin cậy trên hành
              trình xây dựng một cuộc sống cân bằng, khỏe mạnh và hạnh phúc hơn.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Quote - Graphic */}
      <section className="px-4 py-4 sm:py-6">
        <div className="shell">
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-14 text-center sm:px-16 sm:py-20"
            style={{
              background:
                "linear-gradient(135deg, var(--green-deep) 0%, color-mix(in srgb, var(--green-deep) 70%, #0d1f0d) 100%)",
            }}
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <p className="relative z-10 font-serif text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">
              Thông điệp của Lumia
            </p>
            <blockquote className="relative z-10 mx-auto mt-6 max-w-2xl font-serif text-[19px] font-medium italic leading-[1.75] text-white/90 sm:text-[24px]">
              "Mỗi giấc ngủ là một cơ hội để cơ thể hồi phục và tâm trí được nghỉ ngơi. Hãy bắt đầu từ
              những điều nhỏ bé hôm nay để thức dậy với phiên bản tốt hơn của chính mình vào ngày mai."
            </blockquote>
            <div className="relative z-10 mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-white/25" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Lumia</p>
              <div className="h-px w-12 bg-white/25" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="px-4 py-16 sm:py-20">
        <div className="shell">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--green)" }}>
              Dinh huong phat trien
            </p>
            <h2
              className="mt-2 font-serif text-[28px] font-semibold sm:text-[34px]"
              style={{ color: "var(--foreground)" }}
            >
              Tầm nhìn & Sứ mệnh
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Vision */}
            <div
              className="relative overflow-hidden rounded-[28px] p-8 sm:p-10"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full opacity-10 blur-3xl"
                style={{ background: "var(--green)" }}
              />
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: "var(--green-wash)" }}
                  >
                    <Rocket className="h-5 w-5" style={{ color: "var(--green)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--green)" }}>
                      Vision
                    </p>
                    <h3 className="font-serif text-[18px] font-semibold" style={{ color: "var(--foreground)" }}>
                      Tầm nhìn
                    </h3>
                  </div>
                </div>
                <p className="text-[14.5px] leading-[1.8]" style={{ color: "var(--muted)" }}>
                  Trong vòng 5 năm tới, Lumia đặt mục tiêu trở thành hệ sinh thái hàng đầu về sức khỏe
                  tinh thần và giấc ngủ, ứng dụng công nghệ tiên tiến tại Việt Nam, sử dụng trí tuệ nhân
                  tạo và phân tích dữ liệu để cung cấp các giải pháp dễ tiếp cận, cá nhân hóa và dựa
                  trên bằng chứng cho người dùng kỹ thuật số hiện đại.
                </p>
                <div className="mt-6 flex items-end gap-1.5">
                  {[1, 2, 3, 4, 5].map((y) => (
                    <div key={y} className="flex flex-col items-center gap-1">
                      <div
                        className="w-6 rounded-t-sm transition-all"
                        style={{
                          height: `${y * 8 + 8}px`,
                          background: y <= 5 ? `color-mix(in srgb, var(--green) ${y * 20}%, var(--border))` : "var(--border)",
                        }}
                      />
                      <span className="text-[9px]" style={{ color: "var(--muted)" }}>Y{y}</span>
                    </div>
                  ))}
                  <span className="ml-2 text-[11px] font-semibold" style={{ color: "var(--green)" }}>
                    Top 1 VN
                  </span>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div
              className="relative overflow-hidden rounded-[28px] p-8 sm:p-10"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full opacity-10 blur-3xl"
                style={{ background: "var(--green-deep)" }}
              />
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: "var(--green-wash)" }}
                  >
                    <Target className="h-5 w-5" style={{ color: "var(--green)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--green)" }}>
                      Mission
                    </p>
                    <h3 className="font-serif text-[18px] font-semibold" style={{ color: "var(--foreground)" }}>
                      Sứ mệnh
                    </h3>
                  </div>
                </div>
                <p className="text-[14.5px] leading-[1.8]" style={{ color: "var(--muted)" }}>
                  Lumia được xây dựng với sứ mệnh cải thiện sức khỏe tinh thần thông qua việc nâng cao
                  chất lượng giấc ngủ bằng cách cung cấp một nền tảng kỹ thuật số cá nhân hóa, kết hợp
                  huấn luyện giấc ngủ bằng trí tuệ nhân tạo, phân tích tâm trạng, nhật ký cảm xúc, nội
                  dung thiền định và các công cụ hỗ trợ sức khỏe thể chất. Lumia hướng đến mục tiêu giúp
                  người dùng biến giờ đi ngủ thành một thói quen hàng ngày lành mạnh hơn, có chủ đích
                  hơn và phục hồi sức khỏe tốt hơn.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["AI Coaching", "Mood Analysis", "Sleep Data", "Meditation", "Wellness Tools"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section
        className="px-4 py-16 sm:py-20"
        style={{
          background: "color-mix(in srgb, var(--green-wash) 35%, var(--surface))",
        }}
      >
        <div className="shell">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--green)" }}>
              Core Values
            </p>
            <h2
              className="mt-2 font-serif text-[28px] font-semibold sm:text-[34px]"
              style={{ color: "var(--foreground)" }}
            >
              Giá trị cốt lõi
            </h2>
            <p className="mt-2 text-[13.5px] font-medium tracking-wide" style={{ color: "var(--muted)" }}>
              Empathy · Convenience · Responsibility
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {VALUES.map(({ en, vi, icon: Icon, color, iconColor, desc }) => (
              <div
                key={en}
                className={`group relative overflow-hidden rounded-[24px] bg-gradient-to-br p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)] ${color}`}
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="mb-4">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    {en}
                  </p>
                  <h3 className="mt-0.5 font-serif text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
                    {vi}
                  </h3>
                </div>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-16 sm:py-20">
        <div className="shell">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--green)" }}>
                Lien he
              </p>
              <h2 className="mt-2 font-serif text-[28px] font-semibold" style={{ color: "var(--foreground)" }}>
                Kết nối với Lumia
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                Nếu bạn có bất kỳ câu hỏi, góp ý hoặc mong muốn đồng hành cùng Lumia trên hành trình
                chăm sóc giấc ngủ và sức khỏe tinh thần, chúng tôi luôn sẵn sàng lắng nghe.
              </p>
            </div>

            <div
              className="overflow-hidden rounded-[28px]"
              style={{ border: "1px solid var(--border)", background: "var(--surface-card)" }}
            >
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "lumiavn@gmail.com",
                  href: "mailto:lumiavn@gmail.com",
                },
                {
                  icon: Globe,
                  label: "Website",
                  value: "lumia.com.vn",
                  href: "https://lumia.com.vn",
                },
                {
                  icon: ExternalLink,
                  label: "Facebook",
                  value: "LUMIA - Dong hanh cung giac ngu Viet",
                  href: "https://www.facebook.com/share/181NRssH8n/?mibextid=wwXIfr",
                },
                {
                  icon: MapPin,
                  label: "Dia chi",
                  value: "Ha Noi, Viet Nam",
                  href: null,
                },
              ].map(({ icon: Icon, label, value, href }, idx, arr) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 px-7 py-5 ${idx < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "var(--green-wash)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--green)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: "var(--muted)" }}
                    >
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-[14px] font-medium transition hover:underline"
                        style={{ color: "var(--foreground)" }}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-[14px] font-medium" style={{ color: "var(--foreground)" }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90"
                style={{
                  background: "var(--green)",
                  boxShadow: "0 8px 24px rgba(95,111,82,0.35)",
                }}
              >
                Bat dau hanh trinh cung Lumia
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
