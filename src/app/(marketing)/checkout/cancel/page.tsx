import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="shell py-16 md:py-20">
      <div className="dash-panel mx-auto max-w-3xl p-8 text-center md:p-10">
        <span className="eyebrow">Chưa hoàn tất</span>
        <h1 className="mt-5 font-serif text-4xl md:text-5xl" style={{ color: "var(--green-deep)" }}>
          Không sao, mình quay lại thật nhẹ nhàng.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8" style={{ color: "var(--muted)" }}>
          Bạn có thể chọn lại chiếc hộp phù hợp hoặc tiếp tục sau khi sẵn sàng. Mọi thứ vẫn ở đây, không cần vội.
        </p>
        <div className="dash-panel mx-auto mt-8 max-w-xl px-6 py-5 text-left text-sm leading-6" style={{ color: "var(--green-deep)" }}>
          Nếu bạn cần thêm một chút thời gian, hãy quay lại khi mọi thứ nhẹ hơn. LUMIA vẫn ở đây để chờ bạn.
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/store" className="button-primary">
            Xem lại các hộp
          </Link>
          <Link href="/checkout" className="button-secondary">
            Thử lại
          </Link>
        </div>
      </div>
    </main>
  );
}
