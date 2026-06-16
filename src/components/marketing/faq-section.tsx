"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const faqs = [
  {
    q: "Lumia giúp tôi ngủ ngon hơn như thế nào?",
    a: "Lumia hỗ trợ theo dõi giấc ngủ, phân tích thói quen và cung cấp các giải pháp cá nhân hóa giúp bạn cải thiện chất lượng nghỉ ngơi.",
  },
  {
    q: "Lumia khác gì so với các ứng dụng sức khỏe thông thường?",
    a: "Lumia kết hợp công nghệ AI, dữ liệu giấc ngủ và chăm sóc sức khỏe tinh thần trong một hệ sinh thái toàn diện.",
  },
  {
    q: "Mood Test là gì?",
    a: "Mood Test là bài đánh giá giúp bạn theo dõi tâm trạng, cảm xúc và mức độ căng thẳng theo thời gian.",
  },
  {
    q: "AI Chatbot hoạt động như thế nào?",
    a: "AI Chatbot lắng nghe, trò chuyện và đưa ra những gợi ý phù hợp dựa trên trạng thái cảm xúc của bạn.",
  },
  {
    q: "Dữ liệu của tôi có được bảo mật không?",
    a: "Có. Lumia cam kết bảo vệ và bảo mật thông tin cá nhân của người dùng.",
  },
  {
    q: "Lumia có miễn phí không?",
    a: "Lumia cung cấp cả tính năng miễn phí và các gói nâng cao để đáp ứng nhu cầu khác nhau của người dùng.",
  },
  {
    q: "Ai phù hợp sử dụng Lumia?",
    a: "Bất kỳ ai muốn cải thiện giấc ngủ, chăm sóc sức khỏe tinh thần và xây dựng lối sống cân bằng hơn.",
  },
  {
    q: "Lumia có những tính năng nào nổi bật?",
    a: "Mood Test, AI Chatbot, phân tích giấc ngủ, thư viện âm thanh thư giãn và các công cụ hỗ trợ sức khỏe tinh thần.",
  },
  {
    q: "Tôi có thể liên hệ đội ngũ hỗ trợ bằng cách nào?",
    a: "Bạn có thể liên hệ với chúng tôi qua email, website hoặc các kênh mạng xã hội chính thức của Lumia.",
  },
  {
    q: "Tôi bắt đầu sử dụng Lumia như thế nào?",
    a: "Chỉ cần tải ứng dụng, tạo tài khoản và hoàn thành vài bước thiết lập ban đầu để bắt đầu trải nghiệm.",
  },
  {
    q: "Tôi có cần đăng ký tài khoản không?",
    a: "Có. Việc đăng ký giúp Lumia cá nhân hóa trải nghiệm và lưu trữ dữ liệu của bạn an toàn hơn.",
  },
  {
    q: "Lumia có thay thế chuyên gia tâm lý không?",
    a: "Không. Lumia là công cụ hỗ trợ sức khỏe tinh thần và không thay thế cho tư vấn hoặc điều trị chuyên môn.",
  },
  {
    q: "Vì sao giấc ngủ lại quan trọng?",
    a: "Giấc ngủ chất lượng giúp cơ thể phục hồi, cân bằng cảm xúc và nâng cao sức khỏe thể chất lẫn tinh thần.",
  },
  {
    q: "Lumia đồng hành cùng tôi như thế nào?",
    a: "Lumia giúp bạn hiểu rõ hơn về giấc ngủ, cảm xúc và thói quen sống để từng bước xây dựng cuộc sống cân bằng hơn.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (f) =>
      search.trim() === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="shell py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--green)" }}
          >
            Câu hỏi thường gặp
          </p>
          <h2
            className="font-serif text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Bạn cần giải đáp điều gì?
          </h2>
        </div>

        <div
          className="mb-6 flex items-center gap-3 rounded-[16px] border px-4 py-3"
          style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(null); }}
            placeholder="Tìm kiếm câu hỏi…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
            style={{ color: "var(--foreground)" }}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[14px]" style={{ color: "var(--muted)" }}>
              Không tìm thấy câu hỏi phù hợp.
            </p>
          ) : (
            filtered.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-[16px] border transition-colors"
                  style={{
                    borderColor: isOpen ? "var(--green)" : "var(--border)",
                    background: "var(--surface-card)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 transition-transform duration-200"
                      style={{
                        color: "var(--muted)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p
                          className="border-t px-5 pb-5 pt-4 text-[14px] leading-relaxed"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--muted)",
                          }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
