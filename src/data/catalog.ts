import type { TierCode } from "@/lib/product-tiers";
import {
  formatPricePerMonth,
  formatSavingsLabel,
  getDigitalTiers,
  getHybridTiers,
  getProductTier,
  PRODUCT_TIERS,
} from "@/lib/product-tiers";

export type BoxProduct = {
  tier: TierCode;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  duration: string;
  priceNote?: string;
  savingsNote?: string;
  gradient: string;
  ritualFocus: string;
  digitalAccess: string;
  physicalItems: string[];
  features: string[];
  badge: string;
  ctaLabel: string;
  featured?: boolean;
  group: "digital" | "hybrid" | "promo";
};

function tierToBoxProduct(tierId: TierCode): BoxProduct {
  const tier = getProductTier(tierId);
  const gradients: Record<TierCode, string> = {
    first_time: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    standard: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 50%, #E8EDE3 100%)",
    plus: "linear-gradient(135deg, #E8F0E0 0%, #DDE8D2 40%, #C8D9B8 100%)",
    pro: "linear-gradient(135deg, #E0E8D8 0%, #C5D4B5 50%, #A8BE98 100%)",
    premium: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ultimate: "linear-gradient(135deg, #F5F0E4 0%, #E8DFC8 35%, #D4C9A8 70%, #C8B888 100%)",
  };

  const badges: Record<TierCode, string> = {
    first_time: "Ưu đãi mới",
    standard: "Tiêu chuẩn",
    plus: "Lựa chọn thông minh",
    pro: "Tối ưu số",
    premium: "Trải nghiệm trọn vẹn",
    ultimate: "Cao cấp",
  };

  const taglines: Record<TierCode, string> = {
    first_time: "1 Tháng đầu tiên",
    standard: "1 Tháng",
    plus: "3 Tháng",
    pro: "6 Tháng",
    premium: "3 Tháng",
    ultimate: "6 Tháng",
  };

  const descriptions: Record<TierCode, string> = {
    first_time:
      "Gói ưu đãi dành riêng người dùng mới - trải nghiệm Premium đầy đủ và nhận Welcome Kit tại nhà.",
    standard: "Trải nghiệm tiêu chuẩn - toàn bộ tính năng Premium và AI không giới hạn.",
    plus: "Lựa chọn thông minh - 3 tháng Premium với mức giá tháng hấp dẫn hơn.",
    pro: "Lựa chọn tiết kiệm nhất cho trải nghiệm số - phân tích dữ liệu chuyên sâu dài hạn.",
    premium:
      "Trải nghiệm trọn vẹn - App Premium kèm đặc quyền Sleep Box gửi tận nhà.",
    ultimate:
      "Trải nghiệm cao cấp - App Premium 6 tháng kèm đặc quyền Master Box đầy đủ nhất.",
  };

  const ritualFocus: Record<TierCode, string> = {
    first_time: "Bắt đầu hành trình chăm sóc giấc ngủ trong hệ sinh thái LUMIA.",
    standard: "Duy trì nhịp chăm sóc giấc ngủ và cảm xúc đều đặn.",
    plus: "Cam kết 3 tháng để xây dựng thói quen ngủ ngon bền vững.",
    pro: "Hành trình 6 tháng theo dõi dữ liệu và cải thiện giấc ngủ dài hạn.",
    premium: "Kết hợp trải nghiệm số và ritual vật lý cho giấc ngủ sâu hơn.",
    ultimate: "Hành trình cao cấp với bộ công cụ đa giác quan đầy đủ nhất.",
  };

  return {
    tier: tier.id,
    slug: tier.slug,
    name: tier.name,
    tagline: taglines[tier.id],
    description: descriptions[tier.id],
    price: tier.priceVnd,
    duration: tier.isFirstTimeOnly ? "1 Tháng đầu tiên" : `${tier.durationMonths} Tháng`,
    priceNote: formatPricePerMonth(tier.priceVnd, tier.durationMonths),
    savingsNote: formatSavingsLabel(tier.discountPercent),
    gradient: gradients[tier.id],
    ritualFocus: ritualFocus[tier.id],
    digitalAccess: `Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn${
      tier.durationMonths > 1 ? ` trong ${tier.durationMonths} tháng` : ""
    }.`,
    physicalItems: tier.boxContents,
    features: tier.features,
    badge: badges[tier.id],
    ctaLabel: "Bắt đầu ngay",
    featured: tier.isFeatured,
    group: tier.group,
  };
}

export const lumiaBoxes: BoxProduct[] = PRODUCT_TIERS.filter((t) => t.group !== "promo").map((t) =>
  tierToBoxProduct(t.id),
);

export const promoBox: BoxProduct = tierToBoxProduct("first_time");

export const digitalPackages: BoxProduct[] = getDigitalTiers().map((t) => tierToBoxProduct(t.id));

export const hybridPackages: BoxProduct[] = getHybridTiers().map((t) => tierToBoxProduct(t.id));

export const freeTierInfo = {
  name: "LUMIA FREE",
  price: 0,
  features: [
    "Giới hạn tính năng cơ bản",
    "Nghe Audio cơ bản",
    "AI Chatbot giới hạn 15 lượt/ngày",
    "Mood Test 1 lần/ngày",
  ],
  ctaLabel: "Dùng thử miễn phí",
  ctaHref: "/register?next=/dashboard",
};

export const storeItems = [
  {
    name: "Hũ nến thơm LUMIA",
    description: "Hương thơm dịu nhẹ cho nghi thức buổi tối",
    note: "Công cụ hỗ trợ trong hệ sinh thái LUMIA",
  },
  {
    name: "Hộp trà thảo mộc",
    description: "Thảo mộc thư giãn trước khi ngủ",
    note: "Công cụ hỗ trợ trong hệ sinh thái LUMIA",
  },
  {
    name: "Bịt mắt lụa",
    description: "Che sáng nhẹ nhàng, tạo không gian ngủ riêng",
    note: "Công cụ hỗ trợ trong hệ sinh thái LUMIA",
  },
  {
    name: "Bộ tinh dầu & Xịt gối",
    description: "Kích hoạt giác quan khứu giác cho giấc ngủ sâu",
    note: "Công cụ hỗ trợ trong hệ sinh thái LUMIA",
  },
];

/** @deprecated Use lumiaBoxes or getProductBySlug instead */
export const lumiaBox = lumiaBoxes[0];

export function getProductBySlug(slug: string) {
  if (slug === promoBox.slug) {
    return promoBox;
  }
  return lumiaBoxes.find((box) => box.slug === slug);
}

export function getAllPurchasableProducts(): BoxProduct[] {
  return [promoBox, ...lumiaBoxes];
}
