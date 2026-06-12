import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
  pad = "p-7",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pad?: string;
}) {
  return (
    <section
      className={cn(
        "dash-panel lumia-grain-soft relative flex flex-col rounded-[26px]",
        pad,
        className,
      )}
    >
      {title || action ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title ? (
            <h3 className="font-serif text-[17px] font-semibold text-[var(--foreground)]">{title}</h3>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <div className="flex flex-col">{children}</div>
    </section>
  );
}
