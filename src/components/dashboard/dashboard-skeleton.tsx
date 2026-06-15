export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-4 lg:space-y-0">
      {/* Left column */}
      <div className="space-y-4">
        {/* Greeting */}
        <div className="h-8 w-48 rounded-full bg-[var(--surface)]" />
        {/* Ritual card */}
        <div className="h-[200px] rounded-[26px] bg-[var(--surface)]" />
        {/* Suggestion card */}
        <div className="h-20 rounded-[26px] bg-[var(--surface)]" />
      </div>
      {/* Right column */}
      <div className="space-y-4">
        {/* Mood chart */}
        <div className="h-[140px] rounded-[26px] bg-[var(--surface)]" />
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-[20px] bg-[var(--surface)]" />
          ))}
        </div>
        {/* Mood check-in */}
        <div className="h-40 rounded-[26px] bg-[var(--surface)]" />
      </div>
    </div>
  );
}
