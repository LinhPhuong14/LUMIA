import Link from "next/link";
import type { Route } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AudioLibrary } from "@/components/audio/audio-library";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioMeditationPage() {
  const session = await requireSession();
  return (
    <DashboardShell currentPath="/audio" sessionName={session.name} planLabel="Meditation" title="Meditation library" subtitle="Guided và mini meditation">
      <AudioLibrary category="guided_meditation" />
      <div className="mt-6 flex gap-3">
        <Link href={"/audio/breathing" as Route} className="button-secondary">
          Breathing
        </Link>
        <Link href={"/audio/timer" as Route} className="button-secondary">
          Timer
        </Link>
      </div>
    </DashboardShell>
  );
}
