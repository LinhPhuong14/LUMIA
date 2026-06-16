import type { Metadata } from "next";
import { UnifiedStore } from "@/components/store/unified-store";

export const metadata: Metadata = {
  title: "Cửa hàng – LUMIA",
  description: "Gói LUMIA và sản phẩm wellbeing giúp bạn tạo không gian ngủ và thư giãn tốt hơn.",
};

export default function StorePage() {
  return (
    <main className="marketing-page landing-page">
      <div className="landing-frame py-16">
        <div className="mb-12">
          <span className="lumia-kicker">- LUMIA Store</span>
          <h1 className="lumia-h2 mt-2">Bộ sưu tập Lumia.</h1>
          <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[var(--muted)]">
            Chọn gói LUMIA phù hợp hoặc mua riêng sản phẩm để tạo không gian ngủ và thư giãn tốt hơn.
          </p>
        </div>

        <UnifiedStore />
      </div>
    </main>
  );
}
