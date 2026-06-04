import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth";

const entries = [
  { day: "03/06", mood: "Mệt", summary: "Hôm nay mình thấy hơi quá tải vì công việc." },
  { day: "02/06", mood: "Lo", summary: "Có quá nhiều điều cần nghĩ cùng lúc." },
  { day: "01/06", mood: "Bình yên", summary: "Một tối tương đối nhẹ nhàng và dễ thở." },
  { day: "31/05", mood: "Buồn", summary: "Mình cần được ở yên với cảm xúc lâu hơn một chút." },
] as const;

export default async function HistoryPage() {
  const session = await requireSession();

  return (
    <DashboardShell
      currentPath="/history"
      sessionName={session.name}
      planLabel="Hộp LUMIA Mỗi ngày"
      title="Nhìn lại nhẹ nhàng."
      subtitle="Đây không phải bảng đánh giá. Chỉ là một cách để bạn hiểu mình hơn."
    >
      <div className="space-y-6">
        <section className="soft-card p-6">
          <span className="eyebrow">Tóm tắt 7 ngày</span>
          <p className="mt-4 text-base leading-7 text-muted">
            Trong 7 ngày gần nhất, bạn thường chọn “mệt” và “lo”. LUMIA gợi ý bạn bắt đầu bằng các hoạt động ngắn, không cần nhiều năng lượng.
          </p>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Lịch cảm xúc</span>
          <div className="mt-6 grid gap-3 md:grid-cols-7">
            {[
              { day: "T2", tone: "bg-[#DDE8D2]" },
              { day: "T3", tone: "bg-[#FFF3C7]" },
              { day: "T4", tone: "bg-[#B8CFA6]" },
              { day: "T5", tone: "bg-[#F8E7A1]" },
              { day: "T6", tone: "bg-[#DDE8D2]" },
              { day: "T7", tone: "bg-[#FFF3C7]" },
              { day: "CN", tone: "bg-[#B8CFA6]" },
            ].map((item) => (
              <div key={item.day} className="rounded-[24px] border border-white/70 bg-white/82 p-4 text-center">
                <div className={`mx-auto h-5 w-5 rounded-full ${item.tone} shadow-[0_12px_28px_rgba(244,216,120,0.16)]`} />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">{item.day}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Nhật ký gần đây</span>
          <div className="mt-5 space-y-4">
            {entries.map((entry) => (
              <article key={entry.day} className="rounded-[24px] border border-white/70 bg-white/82 p-5 transition hover:shadow-[0_18px_44px_rgba(143,168,120,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-matcha-deep">{entry.day}</div>
                    <div className="mt-1 text-sm text-muted">{entry.mood}</div>
                  </div>
                  <button type="button" className="button-secondary px-4 py-2">
                    Xem lại
                  </button>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">{entry.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
