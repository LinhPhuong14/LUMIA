import { Quote } from "lucide-react";

export function TestimonialCard({
  quote,
  tag,
}: {
  quote: string;
  tag: string;
}) {
  return (
    <article className="mb-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-[0_12px_30px_rgba(95,111,82,0.08)]">
      <Quote className="h-[18px] w-[18px] text-[var(--green)]" strokeWidth={2} />
      <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">{quote}</p>
      <span className="mt-3.5 inline-block rounded-full bg-[var(--green-wash)] px-3 py-1 text-[11.5px] font-semibold text-[var(--green-deep)]">
        {tag}
      </span>
    </article>
  );
}
