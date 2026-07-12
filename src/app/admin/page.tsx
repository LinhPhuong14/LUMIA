import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { createAdminClient } from "@/lib/supabase/admin";

// Auth/role gating for /admin/* is handled centrally in src/proxy.ts (the
// proven, service-role-based gate). We intentionally do NOT re-gate here with
// requireRole(): that path reads the role via the RLS-scoped Server Component
// client, which — after the project moved to ES256 JWT signing keys — comes
// back empty and 307'd real admins off /admin. The proxy already blocks
// non-admins, and every /api/admin route enforces role independently.
export default async function AdminPage() {
  let stats = { users: 0, orders: 0, reports: 0 };
  const admin = createAdminClient();
  if (admin) {
    const [users, orders, reports] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("reports").select("id", { count: "exact", head: true }),
    ]);
    stats = { users: users.count ?? 0, orders: orders.count ?? 0, reports: reports.count ?? 0 };
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-card)] px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">LUMIA Admin</span>
            <h1 className="mt-0.5 font-serif text-2xl text-[var(--foreground)]">Không gian vận hành</h1>
          </div>
          <a href="/dashboard" className="rounded-full border border-[var(--border)] px-4 py-2 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--foreground)]">
            Về Dashboard
          </a>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <AdminDashboard stats={stats} />
      </div>
    </div>
  );
}
