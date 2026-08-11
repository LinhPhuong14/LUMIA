"use client";

import { useEffect, useState } from "react";

type FeedbackRow = {
  id: string;
  category: string;
  rating: number | null;
  message: string;
  wishes: string | null;
  isPublic: boolean;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Lỗi",
  feature: "Tính năng",
  content: "Nội dung",
  ux: "Trải nghiệm",
  other: "Khác",
};

/** Lỗi được nhìn trước, nên nó cần màu riêng chứ không xếp theo thứ tự bảng chữ. */
const CATEGORY_TONE: Record<string, string> = {
  bug: "bg-red-50 text-red-700",
  feature: "bg-blue-50 text-blue-700",
  content: "bg-amber-50 text-amber-700",
  ux: "bg-[var(--green-wash)] text-[var(--green-deep)]",
  other: "bg-neutral-100 text-neutral-600",
};

export function FeedbackTable() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as {
          feedback?: FeedbackRow[];
          error?: string;
        };
        if (!res.ok) {
          setError(json.error ?? "Không tải được danh sách góp ý.");
          return;
        }
        setRows(json.feedback ?? []);
      })
      .catch(() => setError("Không kết nối được máy chủ."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? rows : rows.filter((r) => r.category === filter);

  if (loading) {
    return <p className="text-sm text-muted">Đang tải góp ý…</p>;
  }

  if (error) {
    return <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-[20px] border border-matcha-soft bg-surface-glass px-4 py-3 text-sm"
        >
          <option value="all">Tất cả ({rows.length})</option>
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label} ({rows.filter((r) => r.category === id).length})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Chưa có góp ý nào.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((row) => (
            <article
              key={row.id}
              className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-medium ${CATEGORY_TONE[row.category] ?? CATEGORY_TONE.other}`}
                >
                  {CATEGORY_LABELS[row.category] ?? row.category}
                </span>
                {row.rating ? (
                  <span className="text-[12px] text-amber-600">{"★".repeat(row.rating)}</span>
                ) : null}
                <span className="flex-1" />
                <span className="text-[12px] text-muted">
                  {new Date(row.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--foreground)]">
                {row.message}
              </p>

              {row.wishes ? (
                <p className="mt-2 whitespace-pre-wrap border-l-2 border-[var(--border)] pl-3 text-[13px] leading-relaxed text-muted">
                  Mong muốn: {row.wishes}
                </p>
              ) : null}

              <p className="mt-3 text-[12px] text-muted">
                {row.userName ?? "Ẩn danh"}
                {row.userEmail ? ` · ${row.userEmail}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
