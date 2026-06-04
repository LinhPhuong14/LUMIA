import { Boxes, CreditCard, ShieldCheck, Users } from "lucide-react";

import { SiteHeader } from "@/components/marketing/site-header";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { requireRole } from "@/lib/auth";
import { ActivationCodeModel, OrderModel, UserModel } from "@/models";

const adminCards = [
  { title: "Sản phẩm", icon: Boxes, copy: "Quản lý hộp quà, mức đồng hành, giá và trạng thái hiển thị." },
  { title: "Đơn hàng", icon: CreditCard, copy: "Theo dõi tiến trình thanh toán và xử lý đơn theo từng trạng thái." },
  { title: "Người dùng", icon: Users, copy: "Quản lý vai trò, quyền truy cập và thông tin cơ bản của tài khoản." },
  { title: "Mã kích hoạt", icon: ShieldCheck, copy: "Theo dõi quà tặng, lượt đổi mã và các trường hợp kích hoạt thủ công." },
];

export default async function AdminPage() {
  await requireRole(["admin", "superadmin"]);

  let stats = {
    users: 0,
    orders: 0,
    codes: 0,
  };

  if (hasMongoConfig()) {
    await connectToDatabase();
    const [users, orders, codes] = await Promise.all([
      UserModel.countDocuments(),
      OrderModel.countDocuments(),
      ActivationCodeModel.countDocuments(),
    ]);
    stats = { users, orders, codes };
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell py-14">
        <div className="mb-8">
          <span className="eyebrow">Quản trị nội bộ</span>
          <h1 className="mt-4 font-serif text-5xl text-matcha-deep">Một không gian vận hành gọn gàng để giữ cho trải nghiệm bên ngoài luôn mềm và đẹp.</h1>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {adminCards.map((card) => (
            <article key={card.title} className="soft-card p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-matcha-soft text-matcha-deep">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-matcha-deep">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{card.copy}</p>
            </article>
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
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Mã kích hoạt</div>
            <div className="mt-3 text-4xl font-semibold text-matcha-deep">{stats.codes}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
