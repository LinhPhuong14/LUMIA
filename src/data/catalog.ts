import type { TierCode } from "@/lib/product-tiers";
import { formatPricePerMonth } from "@/lib/product-tiers";

export type BoxProduct = {
  tier: TierCode;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  duration: string;
  priceNote?: string;
  gradient: string;
  ritualFocus: string;
  digitalAccess: string;
  physicalItems: string[];
  features: string[];
  badge: string;
  ctaLabel: string;
  featured?: boolean;
};

const premiumFeatures = [
  "Truy cập toàn bộ tính năng Premium",
  "AI cá nhân hóa không giới hạn",
] as const;

export const lumiaBoxes: BoxProduct[] = [
  {
    tier: "first_time",
    slug: "first-time-user",
    name: "LUMIA FIRST-TIME USER",
    tagline: "1 Tháng đầu tiên",
    description:
      "Gói dành cho người dùng mới — trải nghiệm đầy đủ Premium và nhận Mini Welcome Box kèm theo.",
    price: 99_000,
    duration: "1 Tháng đầu tiên",
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Bắt đầu hành trình chăm sóc giấc ngủ và sức khỏe tinh thần.",
    digitalAccess:
      "Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn trong tháng đầu.",
    physicalItems: ["1 Hộp trà thảo mộc", "1 Xịt gối mini"],
    features: [
      ...premiumFeatures,
      "Mini Welcome Box: 1 Hộp trà thảo mộc + 1 Xịt gối mini",
    ],
    badge: "Người dùng mới",
    ctaLabel: "Bắt đầu ngay",
  },
  {
    tier: "standard",
    slug: "standard",
    name: "LUMIA STANDARD",
    tagline: "1 Tháng",
    description:
      "Gói tiêu chuẩn hàng tháng — toàn bộ tính năng Premium và ưu đãi khi mua sản phẩm vật lý.",
    price: 129_000,
    duration: "1 Tháng",
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 50%, #E8EDE3 100%)",
    ritualFocus: "Duy trì nhịp chăm sóc giấc ngủ và cảm xúc đều đặn.",
    digitalAccess: "Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn.",
    physicalItems: [],
    features: [
      ...premiumFeatures,
      "Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website",
    ],
    badge: "Tiêu chuẩn",
    ctaLabel: "Bắt đầu ngay",
  },
  {
    tier: "saver",
    slug: "saver",
    name: "LUMIA SAVER",
    tagline: "3 Tháng",
    description:
      "Gói tiết kiệm 3 tháng — trải nghiệm Premium đầy đủ với mức giá tháng hấp dẫn nhất.",
    price: 349_000,
    duration: "3 Tháng",
    priceNote: formatPricePerMonth(349_000, 3),
    gradient: "linear-gradient(135deg, #E8F0E0 0%, #DDE8D2 40%, #C8D9B8 100%)",
    ritualFocus: "Cam kết dài hơn để xây dựng thói quen ngủ ngon bền vững.",
    digitalAccess: "Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn trong 3 tháng.",
    physicalItems: [],
    features: [
      ...premiumFeatures,
      "Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website",
    ],
    badge: "Gói tiết kiệm",
    ctaLabel: "Bắt đầu ngay",
    featured: true,
  },
  {
    tier: "sleep_well",
    slug: "sleep-well",
    name: "LUMIA SLEEP WELL",
    tagline: "3 Tháng",
    description:
      "Gói 3 tháng kèm Sleep Well Box — bộ sản phẩm vật lý hỗ trợ nghi thức buổi tối.",
    price: 699_000,
    duration: "3 Tháng",
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Kết hợp trải nghiệm số và ritual vật lý cho giấc ngủ sâu hơn.",
    digitalAccess: "Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn trong 3 tháng.",
    physicalItems: ["1 Hũ nến thơm", "1 Hộp trà thảo mộc", "1 Bịt mắt lụa"],
    features: [
      ...premiumFeatures,
      "Sleep Well Box: 1 Hũ nến thơm + 1 Hộp trà thảo mộc + 1 Bịt mắt lụa",
    ],
    badge: "Sleep Well",
    ctaLabel: "Bắt đầu ngay",
  },
  {
    tier: "master",
    slug: "sleep-master",
    name: "LUMIA SLEEP MASTER",
    tagline: "6 Tháng",
    description:
      "Gói 6 tháng cao cấp nhất — trải nghiệm Premium đầy đủ và Master Box với bộ sản phẩm hoàn chỉnh.",
    price: 1_199_000,
    duration: "6 Tháng",
    gradient: "linear-gradient(135deg, #FFFEFA 0%, #FFFDF5 35%, #DDE8D2 70%, #FFF3C7 100%)",
    ritualFocus: "Hành trình dài hạn với bộ ritual vật lý đầy đủ nhất.",
    digitalAccess: "Truy cập toàn bộ tính năng Premium và AI cá nhân hóa không giới hạn trong 6 tháng.",
    physicalItems: [
      "1 Hũ nến thơm",
      "1 Hộp trà thảo mộc",
      "1 Bịt mắt lụa",
      "1 Bộ tinh dầu",
      "1 Xịt gối",
    ],
    features: [
      ...premiumFeatures,
      "Master Box: 1 Hũ nến thơm + 1 Hộp trà thảo mộc + 1 Bịt mắt lụa + 1 Bộ tinh dầu + 1 Xịt gối",
    ],
    badge: "Sleep Master",
    ctaLabel: "Bắt đầu ngay",
  },
];

/** @deprecated Use lumiaBoxes or getProductBySlug instead */
export const lumiaBox = lumiaBoxes[0];

export function getProductBySlug(slug: string) {
  return lumiaBoxes.find((box) => box.slug === slug);
}
