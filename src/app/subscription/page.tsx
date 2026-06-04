import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

const tierLabels: Record<string, string> = {
  free: "Hộp LUMIA Khởi đầu",
  "1m": "Hộp LUMIA Khởi đầu",
  "3m": "Hộp LUMIA Mỗi ngày",
  "5m": "Hộp LUMIA Dịu sâu",
};

const tierFeatures: Record<string, string[]> = {
  free: ["Không gian cá nhân", "Ghi nhận cảm xúc hằng ngày", "Nhật ký mở đầu"],
  "1m": ["Không gian cá nhân", "Ghi nhận cảm xúc hằng ngày", "Nhật ký không giới hạn", "Xả rác cảm xúc", "LUMIA lắng nghe 5 lượt/ngày"],
  "3m": [
    "Không gian cá nhân",
    "Ghi nhận cảm xúc hằng ngày",
    "Nhật ký không giới hạn",
    "Xả rác cảm xúc",
    "LUMIA lắng nghe 15 lượt/ngày",
    "Lịch sử cảm xúc 30 ngày",
  ],
  "5m": [
    "Không gian cá nhân",
    "Ghi nhận cảm xúc hằng ngày",
    "Nhật ký không giới hạn",
    "Xả rác cảm xúc",
    "LUMIA lắng nghe sâu hơn",
    "Lịch sử cảm xúc dài hơn",
    "Gợi ý chiêm nghiệm cá nhân hóa",
  ],
};

export default async function SubscriptionPage() {
  const session = await requireSession();

  let subscription = {
    tier: "free",
    status: "Đang hoạt động",
    endsAt: null as string | null,
  };

  if (hasMongoConfig()) {
    await connectToDatabase();
    const snapshot = await getSubscriptionSnapshot(session.userId);
    subscription = {
      tier: snapshot.tier,
      status: snapshot.status,
      endsAt: snapshot.endsAt,
    };
  }

  const planName = tierLabels[subscription.tier] ?? "Hộp LUMIA Khởi đầu";
  const features = tierFeatures[subscription.tier] ?? tierFeatures.free;

  return (
    <DashboardShell
      currentPath="/subscription"
      sessionName={session.name}
      planLabel={planName}
      title="Gói của tôi"
      subtitle="Theo dõi gói hiện tại, quyền truy cập đi kèm và những gì có thể mở thêm nếu bạn muốn đi sâu hơn."
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="soft-card p-6">
          <span className="eyebrow">Gói hiện tại</span>
          <h2 className="mt-4 font-serif text-4xl text-matcha-deep">{planName}</h2>
          <p className="mt-3 text-sm text-muted">Trạng thái: {subscription.status}</p>
          <div className="mt-6 h-3 rounded-full bg-[#DDE8D2]">
            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#8FA878,#F4D878)]" />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            {subscription.endsAt ? `Ngày kết thúc: ${formatDate(subscription.endsAt)}` : "Gói hiện tại đang mở và sẵn sàng cho bạn."}
          </p>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Quyền truy cập</span>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground">
            {features.map((feature) => (
              <li key={feature} className="rounded-[22px] border border-white/70 bg-white/78 px-4 py-3">
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="soft-card p-6 shadow-[0_24px_80px_rgba(244,216,120,0.22)]">
          <span className="eyebrow">Mở khóa sâu hơn</span>
          <h2 className="mt-4 font-serif text-4xl text-matcha-deep">Hộp LUMIA Dịu sâu</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Mở thêm AI lắng nghe cá nhân hóa hơn, lịch sử cảm xúc dài hơn và gợi ý chiêm nghiệm sâu hơn.
          </p>

          <div className="mt-6 rounded-[24px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-5">
            <div className="text-sm text-muted">Thông tin thanh toán gần nhất</div>
            <div className="mt-4 space-y-3 text-sm text-foreground">
              <div className="flex items-center justify-between">
                <span>Ngày mua</span>
                <span>04/06/2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gói</span>
                <span>{planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Số tiền</span>
                <span>890.000đ</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trạng thái</span>
                <span>Đã thanh toán</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/boxes" className="button-primary justify-center">
              Nâng cấp lên hộp dịu sâu
            </Link>
            <Link href="/activate" className="button-secondary justify-center">
              Nhập mã kích hoạt
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
