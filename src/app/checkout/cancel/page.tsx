import Link from "next/link";

import { SiteHeader } from "@/components/marketing/site-header";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell py-20">
        <div className="soft-card mx-auto max-w-3xl p-10 text-center">
          <span className="eyebrow">Chưa hoàn tất</span>
          <h1 className="mt-5 font-serif text-5xl text-matcha-deep">Không sao, mình quay lại thật nhẹ nhàng.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Bạn có thể chọn lại chiếc hộp phù hợp hoặc tiếp tục sau khi sẵn sàng. Mọi thứ vẫn ở đây, không cần vội.
          </p>
          <div className="mx-auto mt-8 max-w-xl rounded-[28px] bg-gradient-to-r from-[#eef4e8] via-white to-[#fff8e7] px-6 py-5 text-left text-sm leading-6 text-matcha-deep">
            Nếu bạn cần thêm một chút thời gian, hãy quay lại khi mọi thứ nhẹ hơn. LUMIA vẫn ở đây để chờ bạn.
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/boxes" className="button-primary">
              Xem lại các hộp
            </Link>
            <Link href="/checkout" className="button-secondary">
              Thử lại
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
