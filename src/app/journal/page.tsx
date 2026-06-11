import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JournalStudio } from "@/components/dashboard/journal-studio";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function JournalPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel={subscription.isActive ? "Hành trình 21 ngày" : "Dùng thử"}
      title="Cứ viết ra thôi."
      subtitle="Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy lòng mình nhẹ xuống một chút."
      isAdmin={session.role === "admin"}
    >
      <JournalStudio isActive={subscription.isActive} />
    </DashboardShell>
  );
}
