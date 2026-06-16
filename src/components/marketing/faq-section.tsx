"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Mail } from "lucide-react";

const GROUPS = ["Tất cả", "Tổng quan", "Tính năng", "Giá cả", "Bảo mật", "Bắt đầu", "Kiến thức", "Hỗ trợ"] as const;
type Group = (typeof GROUPS)[number];

const faqs: { q: string; a: string; tag: Exclude<Group, "Tất cả"> }[] = [
  // Tổng quan
  {
    tag: "Tổng quan",
    q: "Lumia là gì?",
    a: "Lumia là hệ sinh thái công nghệ giúp bạn thấu hiểu và cải thiện giấc ngủ, theo dõi cảm xúc và chăm sóc sức khỏe tinh thần thông qua AI, âm thanh thư giãn và dữ liệu cá nhân hóa.",
  },
  {
    tag: "Tổng quan",
    q: "Lumia khác gì so với các ứng dụng sức khỏe thông thường?",
    a: "Lumia kết hợp AI lắng nghe, dữ liệu giấc ngủ và chăm sóc sức khỏe tinh thần trong một hệ sinh thái toàn diện - thay vì chỉ đếm bước chân hay calo.",
  },
  {
    tag: "Tổng quan",
    q: "Ai phù hợp sử dụng Lumia?",
    a: "Bất kỳ ai muốn cải thiện giấc ngủ, chăm sóc sức khỏe tinh thần và xây dựng lối sống cân bằng - từ sinh viên, nhân viên văn phòng đến người cao tuổi.",
  },
  {
    tag: "Tổng quan",
    q: "Lumia có thay thế chuyên gia tâm lý không?",
    a: "Không. Lumia là công cụ hỗ trợ sức khỏe tinh thần, không thay thế tư vấn hay điều trị chuyên môn. Khi cần, luôn tìm đến chuyên gia.",
  },
  {
    tag: "Tổng quan",
    q: "Lumia đồng hành cùng tôi như thế nào?",
    a: "Lumia giúp bạn hiểu sâu hơn về giấc ngủ, cảm xúc và thói quen sống để từng bước xây dựng cuộc sống cân bằng và hạnh phúc hơn.",
  },
  // Tính năng
  {
    tag: "Tính năng",
    q: "Lumia giúp tôi ngủ ngon hơn như thế nào?",
    a: "Lumia hỗ trợ theo dõi giấc ngủ, phân tích thói quen và cung cấp các giải pháp cá nhân hóa - từ âm thanh thư giãn, bài hít thở đến gợi ý từ AI để cải thiện chất lượng nghỉ ngơi.",
  },
  {
    tag: "Tính năng",
    q: "Mood Test là gì?",
    a: "Mood Test là bài đánh giá giúp bạn theo dõi tâm trạng, cảm xúc và mức độ căng thẳng theo thời gian - từ đó Lumia gợi ý trải nghiệm phù hợp.",
  },
  {
    tag: "Tính năng",
    q: "AI Chatbot hoạt động như thế nào?",
    a: "AI Chatbot lắng nghe, trò chuyện và đưa ra gợi ý phù hợp dựa trên trạng thái cảm xúc của bạn - không phán xét, không áp lực.",
  },
  {
    tag: "Tính năng",
    q: "Lumia có những tính năng nào nổi bật?",
    a: "Mood Test, AI Chatbot, phân tích giấc ngủ, thư viện âm thanh thư giãn, hướng dẫn hít thở, streak theo dõi thói quen và cửa hàng sản phẩm wellbeing.",
  },
  // Giá cả
  {
    tag: "Giá cả",
    q: "Lumia có miễn phí không?",
    a: "Lumia cung cấp gói miễn phí với các tính năng cơ bản. Gói Premium mở khóa AI không giới hạn, âm thanh chuyên sâu và phân tích dữ liệu nâng cao.",
  },
  {
    tag: "Giá cả",
    q: "Có thể hủy gói Premium bất cứ lúc nào không?",
    a: "Có. Bạn có thể hủy gói Premium bất kỳ lúc nào. Quyền lợi Premium vẫn được giữ cho đến hết chu kỳ thanh toán hiện tại.",
  },
  // Bảo mật
  {
    tag: "Bảo mật",
    q: "Dữ liệu của tôi có được bảo mật không?",
    a: "Có. Lumia cam kết bảo vệ thông tin cá nhân. Dữ liệu được mã hóa và không chia sẻ với bên thứ ba mà không có sự đồng ý của bạn.",
  },
  {
    tag: "Bảo mật",
    q: "Lumia lưu trữ dữ liệu cảm xúc của tôi ở đâu?",
    a: "Dữ liệu được lưu trữ an toàn trên hệ thống đám mây được mã hóa. Chỉ bạn mới có quyền truy cập và bạn có thể xóa bất kỳ lúc nào.",
  },
  // Bắt đầu
  {
    tag: "Bắt đầu",
    q: "Tôi bắt đầu sử dụng Lumia như thế nào?",
    a: "Tạo tài khoản miễn phí, hoàn thành vài bước thiết lập ngắn và bắt đầu hành trình chăm sóc bản thân ngay hôm nay.",
  },
  {
    tag: "Bắt đầu",
    q: "Tôi có cần đăng ký tài khoản không?",
    a: "Có. Tài khoản giúp Lumia cá nhân hóa trải nghiệm, lưu dữ liệu tâm trạng và đồng bộ giữa các thiết bị của bạn.",
  },
  // Kiến thức
  {
    tag: "Kiến thức",
    q: "Vì sao giấc ngủ lại quan trọng?",
    a: "Giấc ngủ chất lượng giúp cơ thể phục hồi, cân bằng cảm xúc và nâng cao sức khỏe thể chất lẫn tinh thần - đây là nền tảng của mọi thứ.",
  },
  {
    tag: "Kiến thức",
    q: "Căng thẳng ảnh hưởng đến giấc ngủ như thế nào?",
    a: "Căng thẳng làm tăng cortisol, khiến não khó thư giãn và đi vào giấc ngủ sâu. Quản lý cảm xúc tốt là chìa khóa để cải thiện giấc ngủ.",
  },
  // Hỗ trợ
  {
    tag: "Hỗ trợ",
    q: "Tôi có thể liên hệ đội ngũ hỗ trợ bằng cách nào?",
    a: "Gửi email về lumiavn@gmail.com hoặc nhắn tin qua Facebook và Instagram chính thức của Lumia. Chúng tôi phản hồi trong vòng 24 giờ.",
  },
];

// All tags use the unified green palette - consistent with design system
const TAG_CLASS = "bg-[var(--green-wash)] text-[var(--green-deep)]";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<Group>("Tất cả");

  const filtered = faqs.filter((f) => {
    const matchGroup = activeGroup === "Tất cả" || f.tag === activeGroup;
    const matchSearch =
      search.trim() === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  // Group filtered items by tag for grouped display
  const grouped: { tag: string; items: typeof filtered }[] = [];
  if (activeGroup !== "Tất cả" || search.trim() !== "") {
    grouped.push({ tag: activeGroup === "Tất cả" ? "" : activeGroup, items: filtered });
  } else {
    const seen = new Set<string>();
    for (const g of GROUPS) {
      if (g === "Tất cả") continue;
      const items = filtered.filter((f) => f.tag === g);
      if (items.length > 0 && !seen.has(g)) {
        seen.add(g);
        grouped.push({ tag: g, items });
      }
    }
  }

  // Flat index for open state
  const flatItems = grouped.flatMap((g) => g.items);

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
        <div className="mx-auto mb-6 max-w-2xl">
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

        {/* Group filter tabs */}
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => {
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setActiveGroup(g);
                    setOpen(null);
                  }}
                  className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={
                    isActive
                      ? { background: "var(--green)", color: "#fff", borderColor: "var(--green)" }
                      : { background: "transparent", color: "var(--green-deep)", borderColor: "var(--border)" }
                  }
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ list grouped */}
        <div className="mx-auto max-w-2xl space-y-8">
          {flatItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px]" style={{ color: "var(--muted)" }}>
                Không tìm thấy câu hỏi phù hợp.
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.tag}>
                {/* Group header — only show when "Tất cả" and no search */}
                {activeGroup === "Tất cả" && search.trim() === "" && (
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${TAG_CLASS}`}
                    >
                      {group.tag}
                    </span>
                    <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                  </div>
                )}

                <div className="space-y-3">
                  {group.items.map((faq) => {
                    const flatIdx = flatItems.indexOf(faq);
                    const isOpen = open === flatIdx;
                    return (
                      <motion.div
                        key={flatIdx}
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
                          onClick={() => setOpen(isOpen ? null : flatIdx)}
                          className="flex w-full items-start gap-4 px-5 py-4 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            {/* Only show tag badge when searching across all groups */}
                            {search.trim() !== "" && (
                              <span
                                className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${TAG_CLASS}`}
                              >
                                {faq.tag}
                              </span>
                            )}
                            <span
                              className="block text-[14.5px] font-semibold leading-snug"
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
                  })}
                </div>
              </div>
            ))
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
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--green-wash)" }}
            >
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
