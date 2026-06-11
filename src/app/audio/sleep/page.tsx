import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AudioLibrary } from "@/components/audio/audio-library";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioSleepPage() {
  const session = await requireSession();
  return (
    <DashboardShell currentPath="/audio" sessionName={session.name} planLabel="Sleep" title="Sleep library" subtitle="Âm thanh cho giấc ngủ">
      <AudioLibrary category="sleep_sound" />
    </DashboardShell>
  );
}
