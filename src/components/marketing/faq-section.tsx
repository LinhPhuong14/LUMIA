"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

const FAQS = [
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
    a: "Bạn có thể liên hệ với chúng tôi qua email lumiavn@gmail.com, website hoặc các kênh mạng xã hội chính thức của Lumia.",
  },
  {
    q: "Tôi bắt đầu sử dụng Lumia như thế nào?",
    a: "Chỉ cần tạo tài khoản và hoàn thành vài bước thiết lập ban đầu để bắt đầu trải nghiệm.",
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

function FaqItem({ faq, open, onToggle }: { faq: { q: string; a: string }; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition"
      >
        <span className="text-[14px] font-medium leading-snug text-[var(--foreground)]">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-0.5 shrink-0 text-[var(--muted)]"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[13.5px] leading-relaxed text-[var(--muted)]">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(idx: number) {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <section id="faq" className="section-pad">
      <div className="shell">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4 text-[var(--green)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--green)]">
                Câu hỏi thường gặp
              </span>
            </div>
            <h2 className="font-serif text-[26px] font-semibold leading-tight text-[var(--foreground)] sm:text-[32px]">
              Bạn cần biết gì về Lumia?
            </h2>
            <p className="mt-3 text-[14px] text-[var(--muted)]">
              Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-10 pr-4 text-[13.5px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] ring-[var(--green)]/20 transition focus:border-[var(--green)]/50 focus:ring-4"
            />
          </div>

          {/* Accordion */}
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] px-5">
            {filtered.length > 0 ? (
              filtered.map((faq, idx) => (
                <FaqItem
                  key={faq.q}
                  faq={faq}
                  open={openIdx === idx}
                  onToggle={() => toggle(idx)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="text-3xl opacity-30">🔍</span>
                <p className="text-[13px] text-[var(--muted)]">Không tìm thấy câu hỏi phù hợp.</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <p className="mt-6 text-center text-[13px] text-[var(--muted)]">
            Vẫn còn thắc mắc?{" "}
            <a
              href="mailto:lumiavn@gmail.com"
              className="font-medium text-[var(--green-deep)] underline underline-offset-2 hover:text-[var(--green)]"
            >
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
