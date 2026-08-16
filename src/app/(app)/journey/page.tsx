import { JourneyPanel } from "@/components/dashboard/journey-panel";
import { requireSession } from "@/lib/supabase/auth";

export default async function JourneyPage() {
  const session = await requireSession();

  return (
  <div className="flex min-h-0 flex-1 flex-col">
    <JourneyPanel
      userId={session.id}
      calendarDays={45}
    />
  </div>
  );
}
