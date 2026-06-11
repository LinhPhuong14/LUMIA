import { LumiaLogo } from "@/components/ui/logo";

export function FooterSection() {
  return (
    <footer className="bg-[#F3ECDD] px-8 pb-20 pt-16 md:px-10 lg:px-14">
      <div className="landing-frame grid gap-12 md:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
        <div>
          <LumiaLogo />
          <p className="mt-4 max-w-xs text-[14px] leading-8 text-muted">
            Một beauty wellness ritual dành cho những buổi tối cần chậm lại, mềm
            hơn và dịu hơn với chính mình.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {["IG", "FB"].map((label, index) => (
              <button
                key={index}
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/72 text-muted shadow-[0_12px_26px_rgba(42,51,69,0.08)]"
              >
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[15px] font-semibold text-[#2f2b25]">Hộp LUMIA</div>
          <div className="mt-4 grid gap-3 text-[14px] text-muted">
            <a href="/boxes">Tất cả sản phẩm</a>
            <a href="/boxes">Hộp Khởi đầu</a>
            <a href="/boxes">Hộp Mỗi ngày</a>
            <a href="/boxes">Hộp Dịu sâu</a>
            <a href="/boxes">Hộp Quà tặng</a>
          </div>
        </div>

        <div>
          <div className="text-[15px] font-semibold text-[#2f2b25]">Về LUMIA</div>
          <div className="mt-4 grid gap-3 text-[14px] text-muted">
            <a href="#dong-hanh">Cách đồng hành</a>
            <a href="#testimonials">Cảm nhận</a>
            <a href="/register">Tạo tài khoản</a>
            <a href="/login">Đăng nhập</a>
          </div>
        </div>

        <div>
          <div className="text-[15px] font-semibold text-[#2f2b25]">Hỗ trợ</div>
          <div className="mt-4 grid gap-3 text-[14px] text-muted">
            <a href="/boxes">Mua hộp LUMIA</a>
            <a href="/subscription">Gói của tôi</a>
            <a href="/settings">Cài đặt riêng tư</a>
            <a href="/checkout">Thanh toán</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
