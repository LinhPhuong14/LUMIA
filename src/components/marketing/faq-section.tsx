"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Mail } from "lucide-react";

const faqs = [
  {
    q: "Lumia giúp tôi ngủ ngon hơn như thế nào?",
    a: "Lumia hỗ trợ theo dõi giấc ngủ, phân tích thói quen và cung cấp các giải pháp cá nhân hóa giúp bạn cải thiện chất lượng nghỉ ngơi.",
    tag: "Tính năng",
  },
  {
    q: "Lumia khác gì so với các ứng dụng sức khỏe thông thường?",
    a: "Lumia kết hợp công nghệ AI, dữ liệu giấc ngủ và chăm sóc sức khỏe tinh thần trong một hệ sinh thái toàn diện - thay vì chỉ đếm bước chân hay calo.",
    tag: "Tổng quan",
  },
  {
    q: "Mood Test là gì?",
    a: "Mood Test là bài đánh giá giúp bạn theo dõi tâm trạng, cảm xúc và mức độ căng thẳng theo thời gian - từ đó Lumia gợi ý trải nghiệm phù hợp cho bạn.",
    tag: "Tính năng",
  },
  {
    q: "AI Chatbot hoạt động như thế nào?",
    a: "AI Chatbot lắng nghe, trò chuyện và đưa ra những gợi ý phù hợp dựa trên trạng thái cảm xúc của bạn - không phán xét, không áp lực.",
    tag: "Tính năng",
  },
  {
    q: "Dữ liệu của tôi có được bảo mật không?",
    a: "Có. Lumia cam kết bảo vệ thông tin cá nhân. Dữ liệu được mã hóa và không chia sẻ với bên thứ ba mà không có sự đồng ý của bạn.",
    tag: "Bảo mật",
  },
  {
    q: "Lumia có miễn phí không?",
    a: "Lumia cung cấp gói miễn phí với các tính năng cơ bản. Gói Premium mở khóa AI không giới hạn, âm thanh chuyên sâu và phân tích dữ liệu nâng cao.",
    tag: "Giá cả",
  },
  {
    q: "Ai phù hợp sử dụng Lumia?",
    a: "Bất kỳ ai muốn cải thiện giấc ngủ, chăm sóc sức khỏe tinh thần và xây dựng lối sống cân bằng hơn - từ sinh viên, nhân viên văn phòng đến người cao tuổi.",
    tag: "Tổng quan",
  },
  {
    q: "Lumia có những tính năng nào nổi bật?",
    a: "Mood Test, AI Chatbot, phân tích giấc ngủ, thư viện âm thanh thư giãn, hướng dẫn hít thở và các công cụ hỗ trợ sức khỏe tinh thần.",
    tag: "Tính năng",
  },
  {
    q: "Tôi bắt đầu sử dụng Lumia như thế nào?",
    a: "Chỉ cần tạo tài khoản miễn phí, hoàn thành vài bước thiết lập và bắt đầu hành trình chăm sóc bản thân ngay hôm nay.",
    tag: "Bắt đầu",
  },
  {
    q: "Tôi có cần đăng ký tài khoản không?",
    a: "Có. Tài khoản giúp Lumia cá nhân hóa trải nghiệm, lưu dữ liệu tâm trạng và đồng bộ giữa các thiết bị của bạn.",
    tag: "Bắt đầu",
  },
  {
    q: "Lumia có thay thế chuyên gia tâm lý không?",
    a: "Không. Lumia là công cụ hỗ trợ sức khỏe tinh thần, không thay thế tư vấn hay điều trị chuyên môn. Khi cần, luôn tìm đến chuyên gia.",
    tag: "Tổng quan",
  },
  {
    q: "Vì sao giấc ngủ lại quan trọng?",
    a: "Giấc ngủ chất lượng giúp cơ thể phục hồi, cân bằng cảm xúc và nâng cao sức khỏe thể chất lẫn tinh thần - đây là nền tảng của mọi thứ.",
    tag: "Kiến thức",
  },
  {
    q: "Lumia đồng hành cùng tôi như thế nào?",
    a: "Lumia giúp bạn hiểu sâu hơn về giấc ngủ, cảm xúc và thói quen sống để từng bước xây dựng cuộc sống cân bằng và hạnh phúc hơn.",
    tag: "Tổng quan",
  },
  {
    q: "Tôi có thể liên hệ đội ngũ hỗ trợ bằng cách nào?",
    a: "Gửi email về lumiavn@gmail.com hoặc nhắn tin qua Facebook và Instagram chính thức của Lumia. Chúng tôi phản hồi trong vòng 24 giờ.",
    tag: "Hỗ trợ",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Tính năng": "bg-[var(--green-wash)] text-[var(--green-deep)]",
  "Tổng quan": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  "Bảo mật": "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  "Giá cả": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  "Bắt đầu": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  "Kiến thức": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  "Hỗ trợ": "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
};

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (f) =>
      search.trim() === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "var(--surface-warm, var(--surface))" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--green)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--green-deep)" }}
      />

      <div className="shell relative z-10">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--green)" }}
          >
            Câu hỏi thường gặp
          </p>
          <h2
            className="font-serif text-[32px] font-semibold leading-tight md:text-[40px]"
            style={{ color: "var(--foreground)" }}
          >
            Bạn cần giải đáp điều gì?
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Tìm nhanh câu trả lời cho những thắc mắc phổ biến nhất về Lumia.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 backdrop-blur-sm"
            style={{
              borderColor: "var(--border)",
              background: "color-mix(in srgb, var(--surface-card) 80%, transparent)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(null);
              }}
              placeholder="Tìm kiếm câu hỏi…"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
              style={{ color: "var(--foreground)" }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: "var(--surface)", color: "var(--muted)" }}
              >
                Xoá
              </button>
            )}
          </div>
        </div>

        {/* FAQ list */}
        <div className="mx-auto max-w-2xl space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px]" style={{ color: "var(--muted)" }}>
                Không tìm thấy câu hỏi phù hợp.
              </p>
            </div>
          ) : (
            filtered.map((faq, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  className="overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-200"
                  style={{
                    borderColor: isOpen ? "var(--green)" : "var(--border)",
                    background: isOpen
                      ? "color-mix(in srgb, var(--green-wash) 60%, var(--surface-card))"
                      : "color-mix(in srgb, var(--surface-card) 85%, transparent)",
                    boxShadow: isOpen
                      ? "0 8px 32px rgba(95,111,82,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${TAG_COLORS[faq.tag] ?? ""}`}
                        >
                          {faq.tag}
                        </span>
                      </div>
                      <span
                        className="mt-1.5 block text-[14.5px] font-semibold leading-snug"
                        style={{ color: "var(--foreground)" }}
                      >
                        {faq.q}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1.5 shrink-0"
                      style={{ color: isOpen ? "var(--green)" : "var(--muted)" }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p
                          className="border-t px-5 pb-5 pt-3.5 text-[14px] leading-relaxed"
                          style={{
                            borderColor: "color-mix(in srgb, var(--green) 20%, transparent)",
                            color: "var(--muted)",
                          }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl border px-6 py-8 text-center sm:flex-row sm:text-left"
            style={{
              borderColor: "var(--border)",
              background: "color-mix(in srgb, var(--surface-card) 85%, transparent)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--green-wash)" }}>
              <Mail className="h-5 w-5" style={{ color: "var(--green)" }} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                Vẫn còn thắc mắc?
              </p>
              <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
                Đội ngũ Lumia luôn sẵn sàng hỗ trợ bạn trong vòng 24 giờ.
              </p>
            </div>
            <a
              href="mailto:lumiavn@gmail.com"
              className="shrink-0 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--green)" }}
            >
              Liên hệ chúng tôi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
