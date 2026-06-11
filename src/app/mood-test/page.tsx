import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MoodTestQuiz } from "@/components/dashboard/mood-test-quiz";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function MoodTestPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Kiểm tra cảm xúc"
      subtitle="Vài câu hỏi ngắn để LUMIA gợi ý nội dung phù hợp với bạn."
      isAdmin={session.role === "admin"}
    >
      <MoodTestQuiz isActive={subscription.isActive} />
    </DashboardShell>
  );
}
