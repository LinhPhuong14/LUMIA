"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: "goal",
    title: "Bạn muốn cải thiện điều gì?",
    options: [
      { id: "sleep", label: "Ngủ tốt hơn", value: "sleep" },
      { id: "stress", label: "Giảm stress", value: "stress" },
      { id: "meditation", label: "Tập thiền", value: "meditation" },
    ],
    persist: true,
  },
  {
    id: "bedtime",
    title: "Bạn thường thức đến mấy giờ?",
    options: [
      { id: "early", label: "Trước 22h", value: "early" },
      { id: "mid", label: "22h – 0h", value: "mid" },
      { id: "late", label: "Sau 0h", value: "late" },
    ],
    persist: false,
  },
  {
    id: "experience",
    title: "Bạn đã từng thiền chưa?",
    options: [
      { id: "never", label: "Chưa bao giờ", value: "never" },
      { id: "sometimes", label: "Đôi khi", value: "sometimes" },
      { id: "often", label: "Thường xuyên", value: "often" },
    ],
    persist: false,
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = steps[step];
  const selected = answers[current.id];

  async function finish(allAnswers: Record<string, string>) {
    setLoading(true);
    setError(null);

    sessionStorage.setItem(
      "lumia-onboarding-hints",
      JSON.stringify({
        bedtime: allAnswers.bedtime,
        experience: allAnswers.experience,
      }),
    );

    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingGoal: allAnswers.goal }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Không thể lưu lựa chọn.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  function onSelect(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish({ goal: next.goal ?? value, bedtime: next.bedtime, experience: next.experience });
    }
  }

  return (
    <div className="dashboard-shell-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="soft-card w-full max-w-2xl p-8">
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-matcha-soft/40">
          <div
            className="h-full bg-matcha transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="eyebrow">
          Bước {step + 1}/{steps.length}
        </span>
        <h1 className="mt-4 font-serif text-4xl text-matcha-deep">{current.title}</h1>

        <div className="mt-8 space-y-3">
          {current.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={loading}
              className={`w-full rounded-[24px] border px-5 py-4 text-left transition disabled:opacity-50 ${
                selected === option.value
                  ? "border-matcha bg-matcha-soft/40"
                  : "border-white/70 bg-white/80 hover:bg-white"
              }`}
            >
              <div className="font-medium text-matcha-deep">{option.label}</div>
            </button>
          ))}
        </div>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="button-secondary mt-6"
          >
            Quay lại
          </button>
        ) : null}

        {error ? <p className="mt-3 text-sm text-[#9A5B5B]">{error}</p> : null}
      </div>
    </div>
  );
}
