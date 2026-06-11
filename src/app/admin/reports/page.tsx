"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

type Report = {
  id: string;
  type: string;
  period_start: string;
  period_end: string;
  created_at: string;
  user_id: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data: Report[]) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]));
  }, []);

  async function generate(type: "weekly" | "full_21") {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = (await res.json()) as { error?: string; id?: string };
    setLoading(false);
    setMessage(data.error ?? (data.id ? `Đã generate ${type}.` : "Xong"));
    const listRes = await fetch("/api/reports");
    const list = (await listRes.json()) as Report[];
    setReports(Array.isArray(list) ? list : []);
  }

  return (
    <div className="min-h-screen">
      <main className="shell py-14">
        <Link href="/admin" className="text-sm text-muted hover:text-matcha-deep">
          ← Quản trị
        </Link>
        <h1 className="font-serif text-4xl text-matcha-deep">Báo cáo</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => generate("weekly")}
            disabled={loading}
            className="button-primary disabled:opacity-50"
          >
            {loading ? "Đang generate..." : "Generate Weekly"}
          </button>
          <button
            type="button"
            onClick={() => generate("full_21")}
            disabled={loading}
            className="button-secondary disabled:opacity-50"
          >
            Generate Full 21
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}

        <div className="mt-8 space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="soft-card p-5">
              <div className="font-medium text-matcha-deep">
                {report.type === "weekly" ? "Weekly" : "Full 21"} — {report.user_id.slice(0, 8)}
              </div>
              <div className="text-sm text-muted">
                {report.period_start} → {report.period_end}
              </div>
              <div className="text-[12px] text-muted">
                {new Date(report.created_at).toLocaleString("vi-VN")}
              </div>
            </article>
          ))}
          {reports.length === 0 ? <p className="text-sm text-muted">Chưa có báo cáo.</p> : null}
        </div>
      </main>
    </div>
  );
}
