"use client";

import { useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Button } from "@/components/ui/button";

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
    <AdminPageShell title="Báo cáo">
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => generate("weekly")} disabled={loading} size="sm">
            {loading ? "Đang tạo..." : "Tạo báo cáo tuần"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => generate("full_21")} disabled={loading} size="sm">
            Tạo báo cáo 21 ngày
          </Button>
        </div>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}

        <div className="mt-8 space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="soft-card p-5">
              <div className="font-medium text-matcha-deep">
                {report.type === "weekly" ? "Báo cáo tuần" : "Báo cáo 21 ngày"} — {report.user_id.slice(0, 8)}
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
    </AdminPageShell>
  );
}
