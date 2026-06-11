"use client";

import { useState } from "react";

export default function AdminReportsPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function triggerGenerate() {
    const res = await fetch("/api/reports/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = (await res.json()) as { error?: string; id?: string };
    setMessage(data.error ?? (data.id ? "Đã generate báo cáo." : "Xong"));
  }

  return (
    <main className="shell py-14">
      <h1 className="font-serif text-4xl text-matcha-deep">Báo cáo</h1>
      <button type="button" onClick={triggerGenerate} className="button-primary mt-6">
        Trigger generate (weekly)
      </button>
      {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
    </main>
  );
}
