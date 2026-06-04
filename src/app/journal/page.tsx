import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JournalStudio } from "@/components/dashboard/journal-studio";
import { requireSession } from "@/lib/auth";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;

  const initialMode = params.mode === "journal" ? "journal" : params.mode === "mood" ? "mood" : "release";
  const currentPath = `/journal?mode=${initialMode}`;

  return (
    <DashboardShell
      currentPath={currentPath}
      sessionName={session.name}
      planLabel="Hộp LUMIA Mỗi ngày"
      title="Cứ viết ra thôi."
      subtitle="Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy lòng mình nhẹ xuống một chút."
    >
      <JournalStudio initialMode={initialMode} />
    </DashboardShell>
  );
}
