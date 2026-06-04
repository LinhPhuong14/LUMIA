import type { ProductDefinition } from "@/types/domain";

export const lumiaProducts: ProductDefinition[] = [
  {
    slug: "lumia-soft-box-1m",
    tier: "1m",
    tierLabel: "Khởi đầu mềm",
    name: "Hộp LUMIA Khởi đầu",
    tagline: "Dành cho những ai muốn bắt đầu thật nhẹ.",
    description:
      "Một chiếc hộp nhỏ để bạn bắt đầu quay về với mình mà không thấy áp lực. Mọi thứ đều tối giản, mềm và đủ để bạn thử một nhịp chăm sóc mới.",
    price: 0,
    durationMonths: 1,
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Mở ra một nhịp tối nhẹ, ít áp lực và dễ quay lại.",
    digitalAccess: "Không gian cá nhân, ghi nhận cảm xúc cơ bản, nhật ký mở đầu và không gian lắng nghe dịu nhẹ.",
    physicalItems: ["Nến thơm mini", "Thẻ nghi thức buổi tối", "Thẻ gợi mở viết ra", "Mã kích hoạt LUMIA"],
    features: [
      "Không gian cá nhân",
      "Ghi nhận cảm xúc hằng ngày",
      "Nhật ký mở đầu",
      "Xả cảm xúc nhanh",
      "LUMIA lắng nghe ở mức cơ bản",
    ],
    badge: "Nhẹ nhàng",
    ctaLabel: "Xem hộp khởi đầu",
  },
  {
    slug: "lumia-deep-box-5m",
    tier: "3m",
    tierLabel: "Đi sâu cùng mình",
    name: "Hộp LUMIA Dịu sâu",
    tagline: "Dành cho trải nghiệm đầy đủ hơn với AI lắng nghe và nhật ký cá nhân hóa.",
    description:
      "Phiên bản sâu hơn cho những tối cần được lắng lại thật sự. Bên trong là những vật phẩm chăm sóc bản thân và quyền truy cập số rộng hơn để bạn hiểu mình theo nhịp riêng.",
    price: 0,
    durationMonths: 5,
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Một không gian riêng tư, sâu hơn và có nhiều lớp nâng đỡ hơn.",
    digitalAccess: "Không gian cá nhân, nhật ký sâu hơn, AI lắng nghe nhiều hơn, lịch sử cảm xúc dài hơn và gợi ý chiêm nghiệm cá nhân hóa.",
    physicalItems: [
      "Nến thơm cao cấp",
      "Bịt mắt ngủ",
      "Hương thơm",
      "Thẻ nghi thức buổi tối",
      "Thẻ gợi mở viết ra",
      "Mã kích hoạt LUMIA",
    ],
    features: [
      "Không gian cá nhân",
      "Ghi nhận cảm xúc hằng ngày",
      "Nhật ký không giới hạn",
      "Xả cảm xúc tự do",
      "LUMIA lắng nghe cá nhân hóa hơn",
      "Lịch sử cảm xúc dài hơn",
      "Gợi ý chiêm nghiệm dịu sâu",
    ],
    badge: "Cao cấp",
    ctaLabel: "Xem hộp dịu sâu",
  },
  {
    slug: "lumia-gift-box",
    tier: "gift",
    tierLabel: "Quà tặng dịu dàng",
    name: "Hộp LUMIA Quà tặng",
    tagline: "Một món quà dịu dàng cho người bạn thương.",
    description:
      "Một phiên bản được đóng gói như một món quà tinh tế để bạn tặng cho người mình thương, vẫn đủ đẹp và riêng tư để họ mở ra đúng khi cần.",
    price: 0,
    durationMonths: 1,
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Đẹp, mềm và đủ tinh tế để nói thay một sự quan tâm.",
    digitalAccess: "Tài khoản được mở bằng mã quà tặng, đi kèm không gian cá nhân và quyền truy cập phù hợp với người nhận.",
    physicalItems: ["Thiệp quà tặng", "Thẻ kích hoạt", "Nến mini", "Thẻ gợi mở viết ra", "Mã kích hoạt LUMIA"],
    features: [
      "Tặng một nghi thức trọn vẹn",
      "Mở không gian cá nhân cho người nhận",
      "Nhật ký và ghi nhận cảm xúc",
      "LUMIA lắng nghe ở mức dịu nhẹ",
    ],
    badge: "Quà tặng",
    ctaLabel: "Tạo hộp quà",
  },
];

export function getProductBySlug(slug: string) {
  return lumiaProducts.find((product) => product.slug === slug);
}

export function getTierLabel(tier: ProductDefinition["tier"]) {
  switch (tier) {
    case "1m":
      return "Khởi đầu mềm";
    case "3m":
      return "Mỗi ngày dịu hơn";
    case "5m":
      return "Đi sâu cùng mình";
    case "gift":
      return "Quà tặng dịu dàng";
    default:
      return "Bắt đầu";
  }
}
