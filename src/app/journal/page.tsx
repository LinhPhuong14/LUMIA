import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JournalStudio } from "@/components/dashboard/journal-studio";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const subscription = await getSubscriptionSnapshot(session.id);

  const initialMode = params.mode === "journal" ? "journal" : params.mode === "mood" ? "mood" : "release";
  const currentPath = `/journal?mode=${initialMode}`;

  return (
    <DashboardShell
      currentPath={currentPath}
      sessionName={session.name}
      planLabel={subscription.isActive ? "Hành trình 21 ngày" : "Dùng thử"}
      title="Cứ viết ra thôi."
      subtitle="Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy lòng mình nhẹ xuống một chút."
    >
      <JournalStudio initialMode={initialMode} isActive={subscription.isActive} />
    </DashboardShell>
  );
}
