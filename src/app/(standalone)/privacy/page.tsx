import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lock, Database, Settings2, Share2, ShieldCheck, Trash2, Baby, Mail } from "lucide-react";

const PRIVACY_DESCRIPTION =
  "Lumia thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn như thế nào khi dùng nền tảng chăm sóc giấc ngủ và sức khỏe tinh thần LUMIA.";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Lumia",
  description: PRIVACY_DESCRIPTION,
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "04/09/2026";

type Section = {
  icon: typeof Lock;
  title: string;
  body: ReactNode;
};

const SECTIONS: Section[] = [
  {
    icon: Database,
    title: "Dữ liệu chúng tôi thu thập",
    body: (
      <>
        <p>Để vận hành các tính năng của LUMIA, chúng tôi thu thập các nhóm dữ liệu sau:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Thông tin tài khoản:</strong> email, tên hiển thị, mật khẩu (được mã hoá) khi bạn đăng
            ký hoặc đăng nhập qua Supabase Auth.
          </li>
          <li>
            <strong>Dữ liệu sức khỏe tinh thần &amp; giấc ngủ do bạn chủ động cung cấp:</strong> kết quả bài
            kiểm tra tâm trạng (mood test), nội dung nhật ký (journal), lịch sử trò chuyện với LUMIA (AI
            chat) và mức độ hoàn thành các nghi thức/audio hướng dẫn ngủ.
          </li>
          <li>
            <strong>Dữ liệu đơn hàng:</strong> địa chỉ giao hàng, số điện thoại và thông tin đơn hàng khi
            bạn mua sản phẩm tại Lumia Store; giao dịch thanh toán được xử lý qua cổng PayOS, LUMIA không
            lưu trữ số thẻ hay thông tin tài khoản ngân hàng của bạn.
          </li>
          <li>
            <strong>Dữ liệu kỹ thuật:</strong> thiết lập giao diện (sáng/tối) lưu trên trình duyệt của bạn
            (localStorage), nhật ký hoạt động phục vụ vận hành và phát hiện lỗi.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: Lock,
    title: "Mục đích sử dụng",
    body: (
      <>
        <p>Chúng tôi sử dụng dữ liệu trên để:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>Cung cấp và cá nhân hóa các tính năng cốt lõi: trò chuyện với LUMIA, nhật ký, mood test, gợi ý gói phù hợp, theo dõi streak.</li>
          <li>Xử lý và giao đơn hàng bạn đặt tại Lumia Store.</li>
          <li>Bảo mật tài khoản, phát hiện gian lận và khắc phục sự cố kỹ thuật.</li>
          <li>Liên hệ với bạn khi cần, ví dụ xác nhận đơn hàng hoặc thông báo thay đổi quan trọng.</li>
        </ul>
        <p className="mt-4">
          LUMIA không bán dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo.
        </p>
      </>
    ),
  },
  {
    icon: Settings2,
    title: "Quyền kiểm soát của bạn",
    body: (
      <>
        <p>
          Trong mục <strong>Cài đặt</strong>, bạn có hai công tắc riêng tư có thể bật/tắt bất cứ lúc nào:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Lưu lịch sử LUMIA lắng nghe</strong> — tắt thì cuộc trò chuyện với AI không được ghi
            lại, bạn sẽ không xem lại được sau đó.
          </li>
          <li>
            <strong>Cho phép LUMIA đọc nhật ký</strong> — bật thì AI dùng nhật ký gần nhất làm ngữ cảnh để
            trả lời sát với bạn hơn; tắt thì nhật ký không được đưa vào bất kỳ yêu cầu AI nào.
          </li>
        </ul>
        <p className="mt-4">
          Bạn cũng có thể yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân của mình bất kỳ lúc nào theo mục
          &ldquo;Lưu trữ &amp; xoá dữ liệu&rdquo; bên dưới.
        </p>
      </>
    ),
  },
  {
    icon: Share2,
    title: "Chia sẻ dữ liệu với bên thứ ba",
    body: (
      <>
        <p>LUMIA chỉ chia sẻ dữ liệu với các bên hỗ trợ vận hành dịch vụ, gồm:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>Nhà cung cấp hạ tầng dữ liệu và xác thực (Supabase) để lưu trữ tài khoản và dữ liệu ứng dụng.</li>
          <li>Mô hình AI dùng để tạo phản hồi trò chuyện — chỉ nhận nội dung cần thiết cho cuộc hội thoại, và chỉ khi bạn không tắt các công tắc riêng tư ở trên.</li>
          <li>Cổng thanh toán PayOS để xử lý giao dịch mua hàng.</li>
          <li>Cơ quan nhà nước có thẩm quyền, khi pháp luật Việt Nam yêu cầu.</li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật dữ liệu",
    body: (
      <p>
        Mật khẩu tài khoản được mã hoá, kết nối giữa trình duyệt và máy chủ LUMIA sử dụng HTTPS, và quyền
        truy cập dữ liệu nội bộ được giới hạn theo nguyên tắc cần biết. Không có phương thức truyền dữ liệu
        hay lưu trữ nào an toàn tuyệt đối 100%, nhưng chúng tôi liên tục rà soát và cải thiện các biện pháp
        bảo vệ này.
      </p>
    ),
  },
  {
    icon: Trash2,
    title: "Lưu trữ & xoá dữ liệu",
    body: (
      <p>
        Chúng tôi lưu dữ liệu của bạn trong suốt thời gian tài khoản còn hoạt động. Bạn có thể yêu cầu xoá
        tài khoản và toàn bộ dữ liệu cá nhân liên quan bất kỳ lúc nào bằng cách liên hệ{" "}
        <a href="mailto:lumiavn@gmail.com" className="font-medium underline underline-offset-2" style={{ color: "var(--green-deep)" }}>
          lumiavn@gmail.com
        </a>
        . Yêu cầu sẽ được xử lý trong vòng hợp lý, trừ dữ liệu pháp luật yêu cầu phải lưu giữ (ví dụ hoá đơn,
        chứng từ giao dịch).
      </p>
    ),
  },
  {
    icon: Baby,
    title: "Đối tượng sử dụng",
    body: (
      <p>
        LUMIA không hướng đến trẻ em dưới 13 tuổi và không cố ý thu thập dữ liệu từ nhóm tuổi này. Nếu bạn
        cho rằng con em mình đã cung cấp thông tin cá nhân cho LUMIA, vui lòng liên hệ để chúng tôi xoá dữ
        liệu đó.
      </p>
    ),
  },
];

export default function PrivacyPage() {
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
            Chính sách bảo mật
          </h1>
          <p className="mt-5 text-[15px] leading-[1.8]" style={{ color: "var(--muted)" }}>
            {PRIVACY_DESCRIPTION}
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
                Liên hệ về dữ liệu của bạn
              </h2>
            </div>
            <p className="text-[14.5px] leading-[1.85]" style={{ color: "var(--muted)" }}>
              Có câu hỏi về chính sách này, hoặc muốn thực hiện quyền truy cập/chỉnh sửa/xoá dữ liệu cá
              nhân? Liên hệ chúng tôi qua{" "}
              <a href="mailto:lumiavn@gmail.com" className="font-medium underline underline-offset-2" style={{ color: "var(--green-deep)" }}>
                lumiavn@gmail.com
              </a>
              . Chính sách này có thể được cập nhật theo thời gian; phiên bản mới nhất luôn được đăng tại
              trang này.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
