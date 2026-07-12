import type { ReactNode } from "react";

// Auth/role protection for every /admin/* route is handled centrally in
// src/proxy.ts (Next 16 middleware) — the only place that can refresh the
// Supabase session cookie. Do NOT re-guard here with requireRole(): a Server
// Component can't refresh an expired token, so it would spuriously redirect
// (307) right after the access token expires.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "color-mix(in srgb, var(--background) 50%, white)" }}>
      {children}
    </div>
  );
}
