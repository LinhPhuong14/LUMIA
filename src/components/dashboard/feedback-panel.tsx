"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "feature", label: "Tính năng mới" },
  { id: "ux", label: "Trải nghiệm sử dụng" },
  { id: "content", label: "Nội dung & gợi ý" },
  { id: "bug", label: "Lỗi kỹ thuật" },
  { id: "other", label: "Khác" },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

const RATINGS = [
  { score: 1, emoji: "😞", label: "Chưa hài lòng" },
  { score: 2, emoji: "😐", label: "Tạm ổn" },
  { score: 3, emoji: "🙂", label: "Khá tốt" },
  { score: 4, emoji: "😊", label: "Hài lòng" },
  { score: 5, emoji: "🤩", label: "Tuyệt vời" },
];

type PastItem = {
  id: string;
  category: Category;
  rating: number | null;
  message: string;
  wishes: string | null;
  created_at: string;
};

function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function PastFeedbackItem({ item }: { item: PastItem }) {
  const [open, setOpen] = useState(false);
  const date = new Date(item.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]">
            {categoryLabel(item.category)}
          </span>
          {item.rating ? (
            <span className="ml-2 text-[13px]">
              {RATINGS.find((r) => r.score === item.rating)?.emoji}
            </span>
          ) : null}
          <p className="mt-0.5 line-clamp-1 text-[13px] text-[var(--fg)]">{item.message}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 pl-3">
          <span className="text-[11px] text-[var(--muted)]">{date}</span>
          <ChevronDown
            className={cn("h-4 w-4 text-[var(--muted)] transition-transform", open && "rotate-180")}
          />
        </div>
      </button>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">{item.message}</p>
          {item.wishes ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]">
                Mong muốn
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">{item.wishes}</p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function FeedbackPanel() {
  const [category, setCategory] = useState<Category | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [wishes, setWishes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [past, setPast] = useState<PastItem[] | null>(null);
  const [loadingPast, setLoadingPast] = useState(false);

  async function loadPast() {
    if (past !== null) return;
    setLoadingPast(true);
    try {
      const res = await fetch("/api/feedback");
      const json = (await res.json()) as { feedback: PastItem[] };
      setPast(json.feedback ?? []);
    } finally {
      setLoadingPast(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !message.trim()) return;
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        rating: rating ?? undefined,
        message: message.trim(),
        wishes: wishes.trim() || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    setDone(true);
    setPast(null);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-[var(--green)]" />
        <div>
          <p className="font-serif text-xl text-[var(--matcha-deep)]">Cảm ơn bạn!</p>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            Phản hồi của bạn giúp LUMIA ngày càng tốt hơn.
          </p>
        </div>
        <button
          type="button"
          className="button-ghost text-[13px]"
          onClick={() => {
            setDone(false);
            setCategory(null);
            setRating(null);
            setMessage("");
            setWishes("");
          }}
        >
          Gửi thêm phản hồi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="dash-panel rounded-[24px] p-5">
        <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">
          Bạn đang nghĩ gì? Góp ý, báo lỗi, hay chia sẻ điều bạn mong muốn ở LUMIA - chúng mình lắng nghe tất cả.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]">
              Chủ đề
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                    category === cat.id
                      ? "border-[var(--green)] bg-[var(--green)] text-white"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]",
                  )}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]">
              Trải nghiệm hiện tại của bạn
            </p>
            <div className="flex gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.score}
                  type="button"
                  title={r.label}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-all",
                    rating === r.score
                      ? "border-[var(--green)] bg-[var(--green-light)] scale-110"
                      : "border-[var(--border)] hover:border-[var(--green)]",
                  )}
                  onClick={() => setRating(r.score)}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="feedback-message"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]"
            >
              Phản hồi của bạn *
            </label>
            <textarea
              id="feedback-message"
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bạn muốn chia sẻ điều gì với LUMIA?"
              className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:outline-none resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-[var(--muted)]">{message.length}/2000</p>
          </div>

          {/* Wishes */}
          <div>
            <label
              htmlFor="feedback-wishes"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]"
            >
              Mong muốn từ LUMIA
            </label>
            <textarea
              id="feedback-wishes"
              rows={3}
              maxLength={1000}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Tính năng nào bạn muốn có? LUMIA nên cải thiện điều gì?"
              className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[14px] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:outline-none resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-[var(--muted)]">{wishes.length}/1000</p>
          </div>

          {error ? (
            <p className="rounded-[10px] bg-red-50 px-4 py-2 text-[13px] text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!category || !message.trim() || submitting}
            className="button-primary w-full disabled:opacity-50"
          >
            {submitting ? "Đang gửi…" : "Gửi phản hồi"}
          </button>
        </form>
      </div>

      {/* Past feedback */}
      <div>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
          onClick={loadPast}
        >
          Xem phản hồi đã gửi
          <ChevronDown className={cn("h-4 w-4 transition-transform", past !== null && "rotate-180")} />
        </button>

        {loadingPast ? (
          <div className="mt-3 space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[16px] bg-[var(--surface)]" />
            ))}
          </div>
        ) : null}

        {past !== null && !loadingPast ? (
          past.length === 0 ? (
            <p className="mt-3 text-[13px] text-[var(--muted)]">Bạn chưa gửi phản hồi nào.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {past.map((item) => (
                <PastFeedbackItem key={item.id} item={item} />
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
