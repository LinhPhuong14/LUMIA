"use client";

import { useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";

export function ActivationForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/subscriptions/activate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: formData.get("code") }),
    });

    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(result.error ?? "Không thể kích hoạt mã lúc này.");
      setLoading(false);
      return;
    }

    setMessage(result.message ?? "Kích hoạt thành công.");
    setLoading(false);
  }

  return (
    <form action={onSubmit} className="soft-card flex w-full flex-col gap-4 p-7">
      <div>
        <span className="eyebrow">Kích hoạt ngay</span>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Kích hoạt không gian LUMIA của bạn.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Nhập mã trong hộp LUMIA để mở khóa không gian cá nhân và các tính năng đi kèm.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-matcha-deep">
        Nhập mã kích hoạt
        <input
          name="code"
          className="rounded-[24px] border border-matcha-soft bg-white px-4 py-3 outline-none ring-matcha/20 focus:ring-4"
          placeholder="Ví dụ: LUMIA-DEEP-2026"
          required
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="button-primary disabled:opacity-60">
          {loading ? "Đang kích hoạt..." : "Kích hoạt ngay"}
        </button>
        <button type="button" className="button-secondary">
          <QrCode className="mr-2 h-4 w-4" />
          Quét mã QR
        </button>
      </div>

      {message ? (
        <div className="rounded-[24px] border border-matcha-soft bg-[#FFFEFA] px-4 py-4 text-sm text-matcha-deep">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            LUMIA đã sẵn sàng cho tối nay.
          </div>
          <p className="mt-2">{message}</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li>- Không gian cá nhân</li>
            <li>- Ghi nhận cảm xúc</li>
            <li>- Nhật ký</li>
            <li>- Xả cảm xúc</li>
            <li>- LUMIA lắng nghe</li>
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#9A5B5B]">{error}</p> : null}
    </form>
  );
}
