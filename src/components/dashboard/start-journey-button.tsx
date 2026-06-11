"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartJourneyButton({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onStart() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/subscriptions/start", { method: "POST" });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Không thể bắt đầu hành trình.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="button-primary px-5 py-2.5 text-[13px] disabled:opacity-60"
      >
        {loading ? "Đang bắt đầu..." : "Bắt đầu hành trình 21 ngày"}
      </button>
      {error ? <p className="mt-2 text-[13px] text-error">{error}</p> : null}
    </div>
  );
}
