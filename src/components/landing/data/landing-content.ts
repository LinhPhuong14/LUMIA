import {
  CheckCircle2,
  MessageCircleHeart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const heroVideoSources = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
] as const;

export type RitualCard = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

export const ritualCards: RitualCard[] = [
  {
    title: "Mở hộp",
    copy: "Bắt đầu bằng ánh nến, thẻ ritual và cảm giác được chăm sóc vừa đủ.",
    icon: Sparkles,
  },
  {
    title: "Check-in cảm xúc",
    copy: "Chọn mood, mức độ và lý do theo cách nhẹ nhàng, không áp lực.",
    icon: CheckCircle2,
  },
  {
    title: "Đặt xuống một chút",
    copy: "Viết ra hoặc để LUMIA lắng nghe bạn thêm vài phút trước khi nghỉ ngơi.",
    icon: MessageCircleHeart,
  },
];

export type LandingBoxCard = {
  title: string;
  price: string;
  copy: string;
};

export const landingBoxCards: LandingBoxCard[] = [
  {
    title: "LUMIA FIRST-TIME USER",
    price: "99.000đ · 1 tháng đầu",
    copy: "Premium đầy đủ + Mini Welcome Box (trà thảo mộc & xịt gối mini).",
  },
  {
    title: "LUMIA STANDARD",
    price: "129.000đ · 1 tháng",
    copy: "Premium không giới hạn và ưu đãi 10% sản phẩm vật lý trên website.",
  },
  {
    title: "LUMIA SAVER",
    price: "349.000đ · 3 tháng",
    copy: "Gói tiết kiệm — chỉ 116.000đ/tháng, ưu đãi 10% sản phẩm vật lý.",
  },
  {
    title: "LUMIA SLEEP WELL",
    price: "699.000đ · 3 tháng",
    copy: "Premium 3 tháng kèm Sleep Well Box: nến, trà thảo mộc, bịt mắt lụa.",
  },
  {
    title: "LUMIA SLEEP MASTER",
    price: "1.199.000đ · 6 tháng",
    copy: "Gói cao cấp 6 tháng kèm Master Box đầy đủ nhất.",
  },
];

export type Testimonial = {
  quote: string;
  tag: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Lần đầu tiên trong nhiều tháng mình ngủ được thật sự. Cái nghi thức nhỏ đó đã thay đổi cả buổi tối của mình.",
    tag: "Hộp Khởi đầu",
  },
  {
    quote:
      "Mình không ngờ là chỉ cần viết ra vài dòng mà lòng nhẹ đến vậy. LUMIA như người bạn không phán xét.",
    tag: "Workspace",
  },
  {
    quote:
      "Cái hộp đến tay mình vào đúng một tuần rất khó. Mình đã khóc và cảm ơn vì điều đó.",
    tag: "Hộp Dịu sâu",
  },
  {
    quote:
      "AI của LUMIA lắng nghe theo cách mình chưa từng thấy ở bất kỳ app nào. Nó không cố sửa mình.",
    tag: "LUMIA lắng nghe",
  },
  {
    quote:
      "Từ khi có LUMIA, buổi tối của mình có một cái neo. Mình biết mình sẽ dừng lại ở đâu đó trong ngày.",
    tag: "Hộp Mỗi ngày",
  },
  {
    quote:
      "Mình mua tặng bạn thân và nó nhắn lại rằng đó là món quà ý nghĩa nhất năm nay.",
    tag: "Hộp Quà tặng",
  },
  {
    quote:
      "Nhật ký LUMIA giúp mình nhìn lại cảm xúc theo tuần. Mình thấy rõ mình hơn rất nhiều.",
    tag: "Workspace",
  },
  {
    quote:
      "Hương thơm trong hộp, ánh nến nhỏ, những thứ tưởng vô nghĩa lại tạo ra sự khác biệt thật sự.",
    tag: "Hộp Dịu sâu",
  },
  {
    quote:
      "Mình đã từng nghĩ mình không cần được lắng nghe. Bây giờ mình biết mình đã sai.",
    tag: "LUMIA lắng nghe",
  },
];
