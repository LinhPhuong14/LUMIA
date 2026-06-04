import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { requireSession } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <DashboardShell
      currentPath="/settings"
      sessionName={session.name}
      planLabel="Hộp LUMIA Mỗi ngày"
      title="Cài đặt và quyền riêng tư"
      subtitle="Bạn có thể kiểm soát dữ liệu cảm xúc, lịch sử trò chuyện và cách LUMIA phản hồi với mình bất cứ lúc nào."
    >
      <SettingsPanel />
    </DashboardShell>
  );
}
