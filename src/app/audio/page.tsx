import type { Route } from "next";
import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioPage() {
  const session = await requireSession();

  return (
    <DashboardShell
      currentPath="/audio"
      sessionName={session.name}
      planLabel="Thư viện audio"
      title="Âm thanh cho buổi tối"
      subtitle="Sleep, meditation, breathing và timer."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href={"/audio/sleep" as Route} className="soft-card block p-6 transition hover:shadow-lg">
          <h2 className="font-serif text-3xl text-matcha-deep">Sleep</h2>
          <p className="mt-2 text-sm text-muted">Sleep sounds, sleep cast, wind down, sleep music</p>
        </Link>
        <Link href={"/audio/meditation" as Route} className="soft-card block p-6 transition hover:shadow-lg">
          <h2 className="font-serif text-3xl text-matcha-deep">Meditation</h2>
          <p className="mt-2 text-sm text-muted">Guided, mini, breathing, timer</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
