export type BoxProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  gradient: string;
  ritualFocus: string;
  digitalAccess: string;
  physicalItems: string[];
  features: string[];
  badge: string;
  ctaLabel: string;
};

export const lumiaBox: BoxProduct = {
  slug: "lumia-box",
  name: "Hộp LUMIA",
  tagline: "21 ngày đồng hành cùng giấc ngủ và thiền định.",
  description:
    "Một chiếc hộp vật lý kèm quyền truy cập đầy đủ vào không gian số LUMIA — mood check-in, nhật ký, audio, AI lắng nghe và hành trình 21 ngày.",
  price: 890_000,
  gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
  ritualFocus: "Một nghi thức buổi tối nhẹ nhàng để quay về với mình.",
  digitalAccess:
    "Full access 21 ngày: nhật ký, mood, audio đầy đủ, AI lắng nghe không giới hạn, breathing, timer, báo cáo.",
  physicalItems: [
    "Nến thơm",
    "Thẻ nghi thức buổi tối",
    "Thẻ gợi mở viết ra",
    "Bịt mắt ngủ",
  ],
  features: [
    "Hành trình 21 ngày",
    "Nhật ký không giới hạn",
    "Ghi nhận cảm xúc hằng ngày",
    "Thư viện audio đầy đủ",
    "LUMIA lắng nghe cá nhân hóa",
    "Streak & badges",
    "Báo cáo tuần & 21 ngày",
  ],
  badge: "Hộp chính",
  ctaLabel: "Mua hộp LUMIA",
};

export function getProductBySlug(slug: string) {
  return slug === lumiaBox.slug ? lumiaBox : undefined;
}
