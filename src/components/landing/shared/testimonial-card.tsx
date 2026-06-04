import { testimonialCardShadow } from "@/components/landing/shared/landing-motion";

export function TestimonialCard({
  quote,
  tag,
}: {
  quote: string;
  tag: string;
}) {
  return (
    <div
      className="mb-4 flex-shrink-0 rounded-3xl bg-white p-6"
      style={{ boxShadow: testimonialCardShadow }}
    >
      <p className="mb-4 font-serif text-[1.1rem] leading-8 text-foreground/80">
        <span aria-hidden="true">&ldquo;</span>
        {quote}
        <span aria-hidden="true">&rdquo;</span>
      </p>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">Khách hàng LUMIA</p>
          <p className="text-xs text-muted">Việt Nam</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-matcha-soft/40 px-2.5 py-1 text-[11px] tracking-wide text-matcha-deep">
          {tag}
        </span>
      </div>
    </div>
  );
}
