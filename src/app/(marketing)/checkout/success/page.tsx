import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="shell py-16 md:py-20">
      <div className="hero-card mx-auto max-w-3xl p-8 text-center md:p-10">
        <span className="eyebrow">Đã ghi nhận</span>
        <h1 className="mt-5 font-serif text-4xl md:text-5xl" style={{ color: "var(--green-deep)" }}>
          LUMIA đã nhận được thanh toán của bạn.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8" style={{ color: "var(--muted)" }}>
          Cảm ơn bạn đã chọn một nhịp chăm sóc dịu lành hơn cho mình. Không gian của bạn đang được chuẩn bị để có
          thể bắt đầu thật trọn vẹn chỉ sau ít phút.
        </p>
        <div className="dash-panel mx-auto mt-8 max-w-xl px-6 py-5 text-left text-sm leading-6" style={{ color: "var(--green-deep)" }}>
          Gợi ý cho bạn tối nay: hãy bắt đầu từ ghi nhận cảm xúc, viết xuống một dòng mềm dành cho chính mình, rồi
          mở LUMIA lắng nghe nếu bạn cần được ở cạnh thêm một chút.
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
  );
}
