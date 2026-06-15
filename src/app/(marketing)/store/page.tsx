import type { Metadata } from "next";
import { StorePageClient } from "@/components/store/store-page-client";

export const metadata: Metadata = {
  title: "Cửa hàng – LUMIA",
  description: "Sản phẩm vật lý giúp bạn tạo không gian ngủ và thư giãn tốt hơn.",
};

export default function StorePage() {
  return (
    <main className="marketing-page landing-page">
      <div className="landing-frame py-16">
        <div className="mb-10">
          <span className="lumia-kicker">- LUMIA Store</span>
          <h1 className="lumia-h2 mt-2">Sản phẩm chăm sóc giấc ngủ.</h1>
          <p className="mt-3 max-w-[500px] text-base leading-relaxed text-[var(--muted)]">
            Những sản phẩm được LUMIA chọn lọc để tạo không gian ngủ và thư giãn tốt hơn cho bạn.
          </p>
        </div>

        <StorePageClient />
      </div>
    </main>
  );
}
