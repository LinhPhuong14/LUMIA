import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { requireSession } from "@/lib/supabase/auth";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel="Cài đặt"
      title="Cài đặt và quyền riêng tư"
      subtitle="Kiểm soát mục tiêu, dữ liệu cảm xúc và cách LUMIA phản hồi với bạn."
      isAdmin={session.role === "admin"}
    >
      <SettingsPanel
        initialGoal={session.onboardingGoal}
        userName={session.name}
        userEmail={session.email}
      />
    </DashboardShell>
  );
}
