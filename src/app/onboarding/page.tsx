"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const goals = [
  { id: "sleep", label: "Ngủ tốt hơn", copy: "Tôi muốn có giấc ngủ sâu và dễ đi vào hơn." },
  { id: "stress", label: "Giảm stress", copy: "Tôi muốn thả lỏng căng thẳng sau những ngày dài." },
  { id: "meditation", label: "Tập thiền", copy: "Tôi muốn quay về với nhịp thở và sự tĩnh lặng." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    if (!selected) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingGoal: selected }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Không thể lưu lựa chọn.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="dashboard-shell-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="soft-card w-full max-w-2xl p-8">
        <span className="eyebrow">Bắt đầu nhẹ nhàng</span>
        <h1 className="mt-4 font-serif text-4xl text-matcha-deep">Bạn muốn LUMIA đồng hành điều gì?</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Chọn một hướng để LUMIA gợi ý nội dung phù hợp hơn với bạn.</p>

        <div className="mt-8 space-y-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelected(goal.id)}
              className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                selected === goal.id
                  ? "border-matcha bg-matcha-soft/40"
                  : "border-white/70 bg-white/80 hover:bg-white"
              }`}
            >
              <div className="font-medium text-matcha-deep">{goal.label}</div>
              <div className="mt-1 text-sm text-muted">{goal.copy}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!selected || loading}
          onClick={onContinue}
          className="button-primary mt-8 w-full justify-center disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Tiếp tục vào dashboard"}
        </button>

        {error ? <p className="mt-3 text-sm text-[#9A5B5B]">{error}</p> : null}
      </div>
    </div>
  );
}
