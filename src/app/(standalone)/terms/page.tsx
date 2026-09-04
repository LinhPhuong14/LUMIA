import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FileText, UserCheck, HeartPulse, ShoppingBag, Copyright, Ban, ShieldAlert, Scale, Mail } from "lucide-react";

const TERMS_DESCRIPTION =
  "Điều khoản sử dụng nền tảng LUMIA — quy định về tài khoản, nội dung, mua hàng tại Lumia Store và trách nhiệm khi sử dụng dịch vụ.";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Lumia",
  description: TERMS_DESCRIPTION,
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "04/09/2026";

type Section = {
  icon: typeof FileText;
  title: string;
  body: ReactNode;
};

const SECTIONS: Section[] = [
  {
    icon: FileText,
    title: "Chấp nhận điều khoản",
    body: (
      <p>
        Bằng việc truy cập hoặc sử dụng LUMIA — bao gồm trò chuyện với AI, nhật ký, bài kiểm tra tâm trạng,
        nội dung audio và Lumia Store — bạn đồng ý tuân thủ các điều khoản dưới đây. Nếu không đồng ý, vui
        lòng ngừng sử dụng dịch vụ.
      </p>
    ),
  },
  {
    icon: UserCheck,
    title: "Tài khoản của bạn",
    body: (
      <>
        <p>
          Bạn cần tạo tài khoản để sử dụng phần lớn tính năng của LUMIA. Bạn chịu trách nhiệm giữ bí mật mật
          khẩu và mọi hoạt động diễn ra dưới tài khoản của mình. Vui lòng báo ngay cho chúng tôi nếu phát
          hiện truy cập trái phép.
        </p>
        <p className="mt-4">
          Thông tin bạn cung cấp khi đăng ký (email, tên hiển thị...) cần chính xác. LUMIA hướng đến người
          dùng từ 13 tuổi trở lên.
        </p>
      </>
    ),
  },
  {
    icon: HeartPulse,
    title: "Không phải tư vấn y tế",
    body: (
      <p>
        Nội dung của LUMIA — bao gồm phản hồi từ AI, bài kiểm tra tâm trạng, nhật ký, nghi thức và audio hỗ
        trợ giấc ngủ — chỉ mang tính chất hỗ trợ, tham khảo và không thay thế cho chẩn đoán, tư vấn hay điều
        trị y tế chuyên môn. Nếu bạn gặp vấn đề nghiêm trọng về sức khỏe thể chất hoặc tinh thần, hãy tìm
        đến bác sĩ hoặc chuyên gia y tế phù hợp.
      </p>
    ),
  },
  {
    icon: ShoppingBag,
    title: "Đặt hàng và thanh toán tại Lumia Store",
    body: (
      <>
        <p>
          Khi đặt mua sản phẩm tại Lumia Store, bạn xác nhận thông tin đơn hàng (địa chỉ, số điện thoại) là
          chính xác. Thanh toán được xử lý qua cổng PayOS; đơn hàng được xác nhận sau khi thanh toán thành
          công.
        </p>
        <p className="mt-4">
          Giá sản phẩm, tình trạng còn hàng và thời gian giao hàng có thể thay đổi mà không cần báo trước.
          Với các vấn đề về đơn hàng, đổi trả hoặc hoàn tiền, vui lòng liên hệ trực tiếp với chúng tôi để
          được hỗ trợ theo từng trường hợp cụ thể.
        </p>
      </>
    ),
  },
  {
    icon: Copyright,
    title: "Quyền sở hữu trí tuệ",
    body: (
      <p>
        Toàn bộ thương hiệu, giao diện, nội dung blog, nghi thức và tài liệu do LUMIA tạo ra thuộc quyền sở
        hữu của LUMIA hoặc bên cấp phép cho LUMIA. Bạn không được sao chép, phân phối lại hoặc khai thác
        thương mại các nội dung này nếu không có sự đồng ý bằng văn bản của chúng tôi. Nội dung bạn tạo ra
        (nhật ký, kết quả bài kiểm tra...) vẫn thuộc về bạn; chúng tôi chỉ sử dụng để cung cấp dịch vụ theo
        Chính sách bảo mật.
      </p>
    ),
  },
  {
    icon: Ban,
    title: "Hành vi bị cấm",
    body: (
      <>
        <p>Khi sử dụng LUMIA, bạn không được:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>Sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gây hại cho người khác.</li>
          <li>Cố gắng truy cập trái phép hệ thống, dữ liệu của người dùng khác hoặc can thiệp vào hoạt động của nền tảng.</li>
          <li>Giả mạo danh tính hoặc cung cấp thông tin sai sự thật khi đăng ký, đặt hàng.</li>
          <li>Khai thác lỗi hệ thống, thu thập dữ liệu tự động (scraping) trái phép.</li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: "Giới hạn trách nhiệm",
    body: (
      <p>
        LUMIA nỗ lực đảm bảo dịch vụ hoạt động ổn định nhưng không cam kết dịch vụ luôn không bị gián đoạn
        hoặc không có lỗi. Trong phạm vi pháp luật cho phép, LUMIA không chịu trách nhiệm cho các thiệt hại
        gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ, bao gồm các quyết định bạn đưa ra
        dựa trên nội dung do AI tạo ra.
      </p>
    ),
  },
  {
    icon: Scale,
    title: "Chấm dứt & thay đổi điều khoản",
    body: (
      <>
        <p>
          Bạn có thể ngừng sử dụng dịch vụ hoặc yêu cầu xoá tài khoản bất cứ lúc nào. LUMIA có quyền tạm
          ngưng hoặc chấm dứt tài khoản vi phạm các điều khoản này.
        </p>
        <p className="mt-4">
          Chúng tôi có thể cập nhật điều khoản sử dụng theo thời gian; phiên bản mới nhất luôn được đăng tại
          trang này. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa bạn chấp nhận các
          điều khoản đã cập nhật. Điều khoản này được điều chỉnh theo pháp luật Việt Nam.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="pb-0">
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--green) 18%, transparent), transparent)",
          }}
        />
        <div className="shell relative z-10 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--green)" }}>
            Pháp lý
          </p>
          <h1
            className="mt-3 font-serif text-[34px] font-semibold leading-tight sm:text-[46px]"
            style={{ color: "var(--foreground)" }}
          >
            Điều khoản sử dụng
          </h1>
          <p className="mt-5 text-[15px] leading-[1.8]" style={{ color: "var(--muted)" }}>
            {TERMS_DESCRIPTION}
          </p>
          <p className="mt-3 text-[13px] font-medium" style={{ color: "var(--muted)" }}>
            Cập nhật lần cuối: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:pb-28">
        <div className="shell max-w-3xl space-y-10">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "var(--green-wash)" }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: "var(--green)" }} />
                </div>
                <h2 className="font-serif text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {title}
                </h2>
              </div>
              <div className="text-[14.5px] leading-[1.85]" style={{ color: "var(--muted)" }}>
                {body}
              </div>
            </div>
          ))}

          <div
            className="rounded-[24px] p-8"
            style={{ border: "1px solid var(--border)", background: "var(--surface-card)" }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "var(--green-wash)" }}
              >
                <Mail className="h-4.5 w-4.5" style={{ color: "var(--green)" }} />
              </div>
              <h2 className="font-serif text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
                Câu hỏi về điều khoản
              </h2>
            </div>
            <p className="text-[14.5px] leading-[1.85]" style={{ color: "var(--muted)" }}>
              Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ{" "}
              <a href="mailto:lumiavn@gmail.com" className="font-medium underline underline-offset-2" style={{ color: "var(--green-deep)" }}>
                lumiavn@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
