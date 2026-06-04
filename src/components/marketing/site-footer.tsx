import { LumiaLogo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/75 bg-white/76 py-8 backdrop-blur">
      <div className="shell flex flex-col gap-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <LumiaLogo />
          <p className="mt-3 max-w-xl">
            Một nghi thức dịu dàng cho những ngày bạn cần nhẹ lại và quay về với chính mình.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          <span>Hộp LUMIA tinh tế</span>
          <span>Ghi nhận cảm xúc</span>
          <span>Nhật ký dịu nhẹ</span>
          <span>Không gian lắng nghe riêng tư</span>
        </div>
      </div>
    </footer>
  );
}
