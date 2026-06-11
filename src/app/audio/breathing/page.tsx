import { BreathingExercise } from "@/components/audio/breathing-exercise";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/supabase/auth";

export default async function BreathingPage() {
  const session = await requireSession();
  return (
    <DashboardShell currentPath="/audio" sessionName={session.name} planLabel="Breathing" title="Thở cùng LUMIA" subtitle="3 kỹ thuật thở">
      <BreathingExercise />
    </DashboardShell>
  );
}
