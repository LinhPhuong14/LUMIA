import { AiStudio } from "@/components/dashboard/ai-studio";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/supabase/auth";

export default async function AIPage() {
  const session = await requireSession();

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel="LUMIA lắng nghe"
      title="LUMIA lắng nghe bạn."
      subtitle="Một không gian riêng tư để bạn được nói ra điều đang ở trong lòng, theo nhịp nhẹ và không bị phán xét."
      isAdmin={session.role === "admin"}
    >
      <AiStudio />
    </DashboardShell>
  );
}
