import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getProductBySlug, lumiaProducts } from "@/data/catalog";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { getLatestCompletedOrderForUser, getOrderPrimaryProduct, getOrderStatusLabel, getRecentOrdersForUser } from "@/lib/orders";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { formatCurrency, formatDate } from "@/lib/utils";

const tierMap: Record<string, string> = {
  free: "Dùng thử miễn phí",
  "1m": "Hộp LUMIA Khởi đầu",
  "3m": "Hộp LUMIA Mỗi ngày",
  "5m": "Hộp LUMIA Dịu sâu",
  gift: "Hộp LUMIA Quà tặng",
};

const tierSlugMap: Record<string, string | null> = {
  free: null,
  "1m": "lumia-soft-box-1m",
  "3m": "lumia-daily-box-3m",
  "5m": "lumia-deep-box-5m",
  gift: "lumia-gift-box",
};

const ritualExtras = [
  {
    name: "Nến thơm refill",
    price: "Từ 190.000đ",
    copy: "Mua thêm nến để giữ đúng mùi hương bạn đang thích trong nghi thức buổi tối.",
    status: "Sắp mở bán",
  },
  {
    name: "Thẻ câu hỏi nhật ký",
    price: "Từ 120.000đ",
    copy: "Một bộ thẻ gợi mở mới cho những tối bạn muốn viết sâu hơn nhưng chưa biết bắt đầu từ đâu.",
    status: "Sắp mở bán",
  },
  {
    name: "Bộ quà dịu dàng",
    price: "Từ 290.000đ",
    copy: "Những vật phẩm nhỏ để bạn tặng thêm cho mình hoặc cho người bạn thương, không cần mua cả hộp lớn.",
    status: "Sắp mở bán",
  },
] as const;

export default async function DashboardBoxesPage() {
  const session = await requireSession();

  let tier = "free";
  let recentOrders: Awaited<ReturnType<typeof getRecentOrdersForUser>> = [];
  let latestCompletedOrder: Awaited<ReturnType<typeof getLatestCompletedOrderForUser>> = null;

  if (hasMongoConfig()) {
    await connectToDatabase();

    const [subscription, orders, latestPaidOrder] = await Promise.all([
      getSubscriptionSnapshot(session.userId),
      getRecentOrdersForUser(session.userId, 4),
      getLatestCompletedOrderForUser(session.userId),
    ]);

    tier = subscription.tier;
    recentOrders = orders;
    latestCompletedOrder = latestPaidOrder;
  }

  const planLabel = tierMap[tier] ?? "Dùng thử miễn phí";
  const currentProduct = tierSlugMap[tier] ? getProductBySlug(tierSlugMap[tier] ?? "") : null;
  const latestOrderProduct = latestCompletedOrder ? getProductBySlug(getOrderPrimaryProduct(latestCompletedOrder)?.productSlug ?? "") : null;
  const anchorProduct = currentProduct ?? latestOrderProduct ?? null;
  const recommendedProducts = lumiaProducts.filter((product) => product.slug !== anchorProduct?.slug);

  return (
    <DashboardShell
      currentPath="/dashboard/boxes"
      sessionName={session.name}
      planLabel={planLabel}
      title="Hộp dành cho bạn"
      subtitle="Dành cho lúc bạn muốn mua lại hộp cũ, thử một hộp mới hoặc chọn thêm vật phẩm khác để tiếp tục hành trình dịu dàng của mình."
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="soft-card p-6 md:p-7">
            <span className="eyebrow">{anchorProduct ? "Mua lại chiếc hộp đang hợp" : "Bắt đầu mở premium"}</span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">
              {anchorProduct ? anchorProduct.name : "Bạn đang ở chế độ dùng thử miễn phí."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              {anchorProduct
                ? "Nếu chiếc hộp này đang đúng với nhịp của bạn, bạn có thể mua lại ngay để tiếp tục không gian quen thuộc mà không cần chọn lại từ đầu."
                : "Chọn một chiếc hộp khi bạn muốn mở thêm chiều sâu cho workspace, thêm thời gian đồng hành và nhiều lớp lắng nghe hơn."}
            </p>

            {anchorProduct ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-4">
                  <Image src="/assets/boxes-editorial.svg" alt={anchorProduct.name} width={900} height={700} className="h-44 w-full rounded-[22px] object-cover" />
                </div>
                <div>
                  <div className="text-sm font-medium text-matcha-deep">{anchorProduct.tagline}</div>
                  <div className="mt-3 font-serif text-3xl text-matcha-deep">{formatCurrency(anchorProduct.price)}</div>
                  <p className="mt-3 text-sm leading-6 text-muted">{anchorProduct.digitalAccess}</p>
                  {latestCompletedOrder ? (
                    <div className="mt-4 rounded-[22px] border border-white/70 bg-white/82 px-4 py-3 text-sm text-foreground">
                      Đơn gần nhất của bạn là <span className="font-medium">#{latestCompletedOrder.orderCode}</span> vào{" "}
                      <span className="font-medium">{formatDate(latestCompletedOrder.createdAt)}</span>.
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/checkout?product=${anchorProduct.slug}` as Route} className="button-primary">
                      Mua lại hộp này
                    </Link>
                    <Link href={`/boxes/${anchorProduct.slug}` as Route} className="button-secondary">
                      Xem lại chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/boxes?onboarding=1" className="button-primary">
                  Chọn hộp để nâng cấp
                </Link>
                <Link href="/subscription" className="button-secondary">
                  Xem gói hiện tại
                </Link>
              </div>
            )}
          </div>

          <div className="soft-card p-6 shadow-[0_24px_80px_rgba(244,216,120,0.18)]">
            <span className="eyebrow">Lúc nào nên mua thêm</span>
            <div className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              <div className="rounded-[22px] border border-white/70 bg-white/82 px-4 py-3">
                Khi bạn muốn tiếp tục đúng chiếc hộp đang hợp với mình mà không phải chọn lại từ đầu.
              </div>
              <div className="rounded-[22px] border border-white/70 bg-white/82 px-4 py-3">
                Khi bạn muốn đi sâu hơn và mở thêm nhiều quyền truy cập hơn trong workspace.
              </div>
              <div className="rounded-[22px] border border-white/70 bg-white/82 px-4 py-3">
                Khi bạn muốn mua thêm một hộp khác để đổi nhịp, làm quà hoặc dự trữ cho những tuần cần dịu lại nhiều hơn.
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-5">
              <div className="text-sm text-muted">Tình trạng mua gần nhất</div>
              {recentOrders[0] ? (
                <div className="mt-4 space-y-3 text-sm text-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span>Mã đơn</span>
                    <span className="font-medium">#{recentOrders[0].orderCode}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Trạng thái</span>
                    <span className="font-medium">{getOrderStatusLabel(recentOrders[0].status)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Số tiền</span>
                    <span className="font-medium">{formatCurrency(recentOrders[0].totalAmount)}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted">
                  Bạn chưa có đơn hàng nào trong lịch sử. Khi mua hộp đầu tiên, trạng thái đơn sẽ hiện ở đây để bạn tiện theo dõi và mua lại.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="soft-card p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Đổi nhịp hoặc nâng cấp</span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Những hộp khác bạn có thể chọn tiếp</h2>
            </div>
            <Link href="/boxes" className="button-secondary">
              Xem danh mục đầy đủ
            </Link>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {recommendedProducts.map((product) => (
              <article key={product.slug} className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(244,216,120,0.12)]">
                <div className="rounded-[24px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-3">
                  <Image src="/assets/boxes-editorial.svg" alt={product.name} width={900} height={700} className="h-44 w-full rounded-[20px] object-cover" />
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.22em] text-muted">{product.tierLabel}</div>
                <h3 className="mt-3 font-serif text-3xl leading-tight text-matcha-deep">{product.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{product.tagline}</p>
                <div className="mt-4 text-sm font-medium text-matcha-deep">{formatCurrency(product.price)}</div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/checkout?product=${product.slug}` as Route} className="button-primary">
                    Mua hộp này
                  </Link>
                  <Link href={`/boxes/${product.slug}` as Route} className="button-secondary">
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="soft-card p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Lịch sử đơn hàng</span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Những lần mua gần đây của bạn</h2>
            </div>
            <Link href="/subscription" className="button-secondary">
              Xem gói hiện tại
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="mt-7 space-y-4">
              {recentOrders.map((order) => {
                const primaryProduct = getOrderPrimaryProduct(order);

                return (
                  <article key={order.id} className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(143,168,120,0.08)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-muted">Mã đơn #{order.orderCode}</div>
                        <h3 className="mt-2 font-serif text-2xl text-matcha-deep">
                          {order.items.map((item) => item.productName).join(", ")}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          Mua lúc {formatDate(order.createdAt)} · {getOrderStatusLabel(order.status)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <div className="text-sm font-medium text-matcha-deep">{formatCurrency(order.totalAmount)}</div>
                        <div className="flex flex-wrap gap-3">
                          {primaryProduct ? (
                            <Link href={`/checkout?product=${primaryProduct.productSlug}` as Route} className="button-primary">
                              Mua lại
                            </Link>
                          ) : null}
                          <Link href="/subscription" className="button-secondary">
                            Xem trạng thái
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 rounded-[28px] border border-white/70 bg-white/82 p-6 text-sm leading-7 text-muted">
              Chưa có đơn hàng nào để hiển thị. Sau khi mua hộp đầu tiên, lịch sử đơn sẽ xuất hiện ở đây để bạn tiện xem lại và mua tiếp.
            </div>
          )}
        </section>

        <section className="soft-card p-6 md:p-7">
          <span className="eyebrow">Sản phẩm khác</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Thêm những vật phẩm nhỏ cho nghi thức của bạn</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Đây là khu vực dành cho các món mua thêm trong tương lai gần. Mình dựng sẵn trải nghiệm này để người dùng quay lại vẫn có nơi chọn tiếp, thay vì chỉ nhìn thấy mỗi gói subscription.
          </p>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {ritualExtras.map((item) => (
              <article key={item.name} className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(143,168,120,0.08)]">
                <div className="inline-flex rounded-full bg-[#FFF3C7] px-3 py-2 text-xs font-semibold text-matcha-deep">{item.status}</div>
                <h3 className="mt-5 font-serif text-3xl leading-tight text-matcha-deep">{item.name}</h3>
                <div className="mt-3 text-sm font-medium text-matcha-deep">{item.price}</div>
                <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
                <button type="button" className="button-secondary mt-5">
                  Nhắc tôi khi có
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
