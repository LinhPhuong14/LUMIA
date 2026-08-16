import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AudioCategoryPage } from "@/components/audio/audio-category-page";

export default async function AudioMeditationPage() {

  return (
  <div className="flex min-h-0 flex-1 flex-col gap-6">
    {/* Back to audio hub */}
    <Link
      href="/audio"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)] mb-4 mt-2 w-fit"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Âm thanh
    </Link>

    {/* Meditation audio gallery only. Locked tracks open the upgrade modal on click. */}
    <AudioCategoryPage
      categories={["guided_meditation", "mini_meditation"]}
      sections={[
        { title: "Guided Meditation", category: "guided_meditation" },
        { title: "Mini Meditations", category: "mini_meditation" },
      ]}
    />
  </div>
  );
}
