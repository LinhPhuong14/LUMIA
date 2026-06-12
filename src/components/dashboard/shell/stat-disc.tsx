export function StatDisc({
  value,
  unit,
  label,
  accent,
}: {
  value: string;
  unit?: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className="flex h-[66px] w-[66px] flex-col items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(150deg, #ffffff, var(--green-wash))",
          boxShadow:
            "6px 6px 14px rgba(122,140,82,0.16), -5px -5px 12px rgba(255,255,255,0.92)",
        }}
      >
        <span
          className="font-serif text-[22px] font-medium leading-none"
          style={{ color: accent ?? "var(--matcha-deep)" }}
        >
          {value}
        </span>
        {unit ? <span className="mt-0.5 text-[9px] text-[var(--muted)]">{unit}</span> : null}
      </div>
      <span className="text-[11px] tracking-wide text-[var(--muted)]">{label}</span>
    </div>
  );
}
