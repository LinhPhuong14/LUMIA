import { SleepQuizFlow } from "@/components/marketing/sleep-quiz-flow";

export const metadata = {
  title: "Tìm gói LUMIA phù hợp",
  description: "Khảo sát ngắn để LUMIA gợi ý gói thành viên phù hợp nhất với bạn.",
};

export default function QuizPage() {
  return (
    <main className="shell grid min-h-[70vh] gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-16">
      <section className="lg:sticky lg:top-28">
        <p className="text-sm font-medium" style={{ color: "var(--green)" }}>
          Khảo sát 4 câu · 2 phút
        </p>
        <h1
          className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl"
          style={{ color: "var(--title-primary)" }}
        >
          Tìm gói LUMIA phù hợp với bạn
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-7" style={{ color: "var(--muted)" }}>
          Vài câu hỏi nhẹ nhàng về giấc ngủ và cảm xúc — LUMIA sẽ gợi ý gói phù hợp nhất, không áp lực quyết định.
        </p>
      </section>
      <section className="dash-panel p-5 md:p-7">
        <SleepQuizFlow />
      </section>
    </main>
  );
}
