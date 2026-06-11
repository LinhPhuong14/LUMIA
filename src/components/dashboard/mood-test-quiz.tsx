"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { UpsellOverlay } from "@/components/ui/upsell-overlay";

const questions = [
  "Tuần qua bạn cảm thấy căng thẳng như thế nào?",
  "Bạn ngủ có đủ giấc không?",
  "Bạn có khó tập trung vào việc hàng ngày?",
  "Bạn cảm thấy lo lắng về tương lai?",
  "Bạn có thời gian nghỉ ngơi cho bản thân?",
  "Bạn cảm thấy được hỗ trợ từ người xung quanh?",
  "Nhìn chung, bạn hài lòng với cuộc sống hiện tại?",
] as const;

const options = [
  "Không hề / Rất ít",
  "Đôi khi / Một chút",
  "Thường xuyên / Khá nhiều",
  "Luôn luôn / Rất nhiều",
] as const;

type Result = {
  result_label: string;
  recommendations: string[];
};

export function MoodTestQuiz({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch("/api/mood-test")
      .then((r) => r.json())
      .then((data: { hasTaken?: boolean; latest?: Result }) => {
        if (!isActive && data.hasTaken) {
          setBlocked(true);
          if (data.latest) setResult(data.latest);
        }
      })
      .finally(() => setLoading(false));
  }, [isActive]);

  function selectOption(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submit(next);
    }
  }

  async function submit(finalAnswers: number[]) {
    setSubmitting(true);
    const response = await fetch("/api/mood-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    setSubmitting(false);
    if (response.ok) {
      const data = (await response.json()) as Result;
      setResult(data);
      setStep(questions.length);
    } else if (response.status === 403) {
      setBlocked(true);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Đang tải...</p>;
  }

  if (blocked && !isActive) {
    return (
      <UpsellOverlay featureName="Mood Test" description="Làm lại không giới hạn với hộp LUMIA." locked>
        {result ? (
          <div className="soft-card p-6">
            <p className="font-medium text-matcha-deep">Kết quả lần trước: {result.result_label}</p>
          </div>
        ) : (
          <div className="soft-card p-6" />
        )}
      </UpsellOverlay>
    );
  }

  if (result || step >= questions.length) {
    return (
      <div className="soft-card p-8 text-center">
        {submitting ? (
          <p className="text-muted">Đang phân tích...</p>
        ) : (
          <>
            <span className="eyebrow">Kết quả</span>
            <h2 className="mt-4 font-serif text-3xl text-matcha-deep">
              {result?.result_label ?? "Đang xử lý"}
            </h2>
            <p className="mt-4 text-sm text-muted">
              LUMIA gợi ý bạn thử các nội dung phù hợp với trạng thái hiện tại.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {(result?.recommendations ?? []).map((cat) => (
                <Link key={cat} href="/audio" className="button-secondary text-[13px]">
                  {cat}
                </Link>
              ))}
            </div>
            {isActive ? (
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                  setResult(null);
                }}
                className="button-primary mt-6"
              >
                Thử lại
              </button>
            ) : (
              <Link href="/boxes" className="button-primary mt-6 inline-flex">
                Mở khóa không giới hạn
              </Link>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="soft-card p-8">
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-matcha-soft/40">
        <div
          className="h-full bg-matcha transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>
      <span className="eyebrow">
        Câu {step + 1}/{questions.length}
      </span>
      <h2 className="mt-4 font-serif text-2xl text-matcha-deep">{questions[step]}</h2>
      <div className="mt-6 space-y-3">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => selectOption(i + 1)}
            className="w-full rounded-[22px] border border-white/70 bg-white/82 px-5 py-4 text-left text-sm transition hover:bg-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
