import { Boxes, CreditCard, FileText, ShoppingBag, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/marketing/site-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/supabase/auth";

const adminCards: { title: string; href: Route; icon: typeof CreditCard; copy: string }[] = [
  { title: "Đơn hàng", href: "/admin/orders", icon: CreditCard, copy: "Theo dõi thanh toán và trạng thái giao hàng." },
  { title: "Người dùng", href: "/admin/users", icon: Users, copy: "Xem subscription, streak và thông tin tài khoản." },
  { title: "Báo cáo", href: "/admin/reports", icon: FileText, copy: "Xem báo cáo đã generate." },
  { title: "Shop", href: "/store", icon: Boxes, copy: "Xem trang mua hộp như user." },
  { title: "Cửa hàng", href: "/admin/store", icon: ShoppingBag, copy: "Quản lý sản phẩm, tồn kho và đơn hàng." },
];

export default async function AdminPage() {
  await requireRole(["admin"]);

  let stats = { users: 0, orders: 0, reports: 0 };
  const admin = createAdminClient();

  if (admin) {
    const [users, orders, reports] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("reports").select("id", { count: "exact", head: true }),
    ]);
    stats = {
      users: users.count ?? 0,
      orders: orders.count ?? 0,
      reports: reports.count ?? 0,
    };
  }

  return (
    <div className="marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="shell py-14">
        <div className="mb-8">
          <span className="eyebrow">Quản trị nội bộ</span>
          <h1 className="mt-4 font-serif text-5xl text-matcha-deep">Không gian vận hành LUMIA</h1>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {adminCards.map((card) => (
            <Link key={card.title} href={card.href} className="soft-card block p-5 transition hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-matcha-soft text-matcha-deep">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-matcha-deep">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{card.copy}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="soft-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Người dùng</div>
            <div className="mt-3 text-4xl font-semibold text-matcha-deep">{stats.users}</div>
          </div>
          <div className="soft-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Đơn hàng</div>
            <div className="mt-3 text-4xl font-semibold text-matcha-deep">{stats.orders}</div>
          </div>
          <div className="soft-card p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Báo cáo</div>
            <div className="mt-3 text-4xl font-semibold text-matcha-deep">{stats.reports}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
