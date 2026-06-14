import type { TierCode } from "@/lib/product-tiers";

export type SleepQuizAnswers = {
  cause: "work" | "thoughts" | "noise";
  bedtime: "early" | "mid" | "late";
  experience: "never" | "sometimes" | "often";
  preference: "digital" | "physical" | "both";
};

export type QuizStep = {
  id: keyof SleepQuizAnswers;
  title: string;
  options: { id: string; label: string; value: SleepQuizAnswers[keyof SleepQuizAnswers] }[];
};

export const sleepQuizSteps: QuizStep[] = [
  {
    id: "cause",
    title: "Bạn thường mất ngủ do đâu?",
    options: [
      { id: "work", label: "A. Áp lực công việc", value: "work" },
      { id: "thoughts", label: "B. Suy nghĩ miên man", value: "thoughts" },
      { id: "noise", label: "C. Không gian ồn ào", value: "noise" },
    ],
  },
  {
    id: "bedtime",
    title: "Bạn thường thức đến mấy giờ?",
    options: [
      { id: "early", label: "Trước 22h", value: "early" },
      { id: "mid", label: "22h – 0h", value: "mid" },
      { id: "late", label: "Sau 0h", value: "late" },
    ],
  },
  {
    id: "experience",
    title: "Bạn đã từng thiền hoặc thực hành mindfulness chưa?",
    options: [
      { id: "never", label: "Chưa bao giờ", value: "never" },
      { id: "sometimes", label: "Đôi khi", value: "sometimes" },
      { id: "often", label: "Thường xuyên", value: "often" },
    ],
  },
  {
    id: "preference",
    title: "Bạn muốn trải nghiệm LUMIA theo cách nào?",
    options: [
      { id: "digital", label: "Chỉ trên app - theo dõi dữ liệu & AI", value: "digital" },
      { id: "physical", label: "Kèm công cụ vật lý tại nhà", value: "physical" },
      { id: "both", label: "Cả hai - trọn vẹn nhất", value: "both" },
    ],
  },
];

const tierSlugs: Record<TierCode, string> = {
  first_time: "first-time-user",
  standard: "standard",
  plus: "plus",
  pro: "pro",
  premium: "premium",
  ultimate: "ultimate",
};

export type QuizRecommendation = {
  tier: TierCode;
  slug: string;
  reason: string;
};

export function recommendPackage(answers: Partial<SleepQuizAnswers>): QuizRecommendation {
  const { cause, bedtime, experience, preference } = answers;

  if (preference === "physical" || preference === "both") {
    if (cause === "noise" || preference === "both") {
      return {
        tier: "ultimate",
        slug: tierSlugs.ultimate,
        reason:
          "Bạn cần không gian tĩnh lặng đa giác quan - Gói ULTIMATE kèm Master Box với bộ công cụ đầy đủ nhất.",
      };
    }
    return {
      tier: "premium",
      slug: tierSlugs.premium,
      reason:
        "Ritual vật lý sẽ giúp bạn buông căng thẳng - Gói PREMIUM kèm Sleep Box là lựa chọn cân bằng nhất.",
    };
  }

  if (cause === "work" && bedtime === "late") {
    return {
      tier: "pro",
      slug: tierSlugs.pro,
      reason:
        "Áp lực kéo dài cần theo dõi dài hạn - Gói PRO 6 tháng với phân tích dữ liệu chuyên sâu phù hợp với bạn.",
    };
  }

  if (cause === "thoughts" || experience === "never") {
    return {
      tier: "plus",
      slug: tierSlugs.plus,
      reason:
        "3 tháng đủ để xây thói quen viết ra và thở cùng LUMIA - Gói PLUS là lựa chọn thông minh nhất.",
    };
  }

  return {
    tier: "standard",
    slug: tierSlugs.standard,
    reason: "Bắt đầu nhẹ với trải nghiệm Premium đầy đủ - Gói STANDARD linh hoạt theo tháng.",
  };
}
