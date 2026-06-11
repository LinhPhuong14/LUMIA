import Link from "next/link";

import { SiteHeader } from "@/components/marketing/site-header";

export default function CheckoutSuccessPage() {
  return (
    <div className="marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="shell py-20">
        <div className="hero-card mx-auto max-w-3xl p-10 text-center">
          <span className="eyebrow">Đã ghi nhận</span>
          <h1 className="mt-5 font-serif text-5xl text-matcha-deep">LUMIA đã nhận được thanh toán của bạn.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Cảm ơn bạn đã chọn một nhịp chăm sóc dịu lành hơn cho mình. Không gian của bạn đang được chuẩn bị để có thể bắt đầu thật trọn vẹn chỉ sau ít phút.
          </p>
          <div className="mx-auto mt-8 max-w-xl rounded-[28px] bg-gradient-to-r from-[#fff8e7] via-white to-[#eef4e8] px-6 py-5 text-left text-sm leading-6 text-matcha-deep">
            Gợi ý cho bạn tối nay: hãy bắt đầu từ ghi nhận cảm xúc, viết xuống một dòng mềm dành cho chính mình, rồi mở LUMIA lắng nghe nếu bạn cần được ở cạnh thêm một chút.
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="button-primary">
              Mở không gian của bạn
            </Link>
            <Link href="/account" className="button-secondary">
              Xem gói của bạn
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
