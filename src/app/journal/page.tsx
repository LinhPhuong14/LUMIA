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
      sessionEmail={session.email}
      subscription={subscription}
      title="Cứ viết ra thôi."
      subtitle="Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy lòng mình nhẹ xuống một chút."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <JournalStudio isActive={subscription.isActive} />
      </div>
    </DashboardShell>
  );
}
