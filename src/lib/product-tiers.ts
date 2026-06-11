export type TierCode = "first_time" | "standard" | "saver" | "sleep_well" | "master";

export type PhysicalBoxType = "mini_wellcome" | "sleep_well" | "master";

export type ProductTier = {
  id: TierCode;
  name: string;
  slug: string;
  durationMonths: number;
  priceVnd: number;
  hasPhysicalBox: boolean;
  physicalBoxType: PhysicalBoxType | null;
  boxContents: string[];
  features: string[];
  isFeatured: boolean;
  isFirstTimeOnly: boolean;
  discountPercent: number;
  sortOrder: number;
};

export const PRODUCT_TIERS: ProductTier[] = [
  {
    id: "first_time",
    name: "LUMIA FIRST-TIME USER",
    slug: "first-time-user",
    durationMonths: 1,
    priceVnd: 99_000,
    hasPhysicalBox: true,
    physicalBoxType: "mini_wellcome",
    boxContents: ["1 Hộp trà thảo mộc", "1 Xịt gối mini"],
    features: ["Truy cập toàn bộ tính năng Premium", "AI cá nhân hóa không giới hạn"],
    isFeatured: false,
    isFirstTimeOnly: true,
    discountPercent: 0,
    sortOrder: 1,
  },
  {
    id: "standard",
    name: "LUMIA STANDARD",
    slug: "standard",
    durationMonths: 1,
    priceVnd: 129_000,
    hasPhysicalBox: false,
    physicalBoxType: null,
    boxContents: [],
    features: [
      "Truy cập toàn bộ tính năng Premium",
      "AI cá nhân hóa không giới hạn",
      "Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website",
    ],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 10,
    sortOrder: 2,
  },
  {
    id: "saver",
    name: "LUMIA SAVER",
    slug: "saver",
    durationMonths: 3,
    priceVnd: 349_000,
    hasPhysicalBox: false,
    physicalBoxType: null,
    boxContents: [],
    features: [
      "Truy cập toàn bộ tính năng Premium",
      "AI cá nhân hóa không giới hạn",
      "Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website",
    ],
    isFeatured: true,
    isFirstTimeOnly: false,
    discountPercent: 10,
    sortOrder: 3,
  },
  {
    id: "sleep_well",
    name: "LUMIA SLEEP WELL",
    slug: "sleep-well",
    durationMonths: 3,
    priceVnd: 699_000,
    hasPhysicalBox: true,
    physicalBoxType: "sleep_well",
    boxContents: ["1 Hũ nến thơm", "1 Hộp trà thảo mộc", "1 Bịt mắt lụa"],
    features: ["Truy cập toàn bộ tính năng Premium", "AI cá nhân hóa không giới hạn"],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 0,
    sortOrder: 4,
  },
  {
    id: "master",
    name: "LUMIA SLEEP MASTER",
    slug: "sleep-master",
    durationMonths: 6,
    priceVnd: 1_199_000,
    hasPhysicalBox: true,
    physicalBoxType: "master",
    boxContents: [
      "1 Hũ nến thơm",
      "1 Hộp trà thảo mộc",
      "1 Bịt mắt lụa",
      "1 Bộ tinh dầu",
      "1 Xịt gối",
    ],
    features: ["Truy cập toàn bộ tính năng Premium", "AI cá nhân hóa không giới hạn"],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 0,
    sortOrder: 5,
  },
];

export function getProductTier(code: TierCode): ProductTier {
  const tier = PRODUCT_TIERS.find((t) => t.id === code);
  if (!tier) {
    throw new Error(`Unknown tier: ${code}`);
  }
  return tier;
}

export function getProductTierBySlug(slug: string): ProductTier | undefined {
  return PRODUCT_TIERS.find((t) => t.slug === slug);
}

export function slugToTierCode(slug: string): TierCode | undefined {
  return getProductTierBySlug(slug)?.id;
}

export function isValidTierCode(value: string): value is TierCode {
  return PRODUCT_TIERS.some((t) => t.id === value);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDurationLabel(months: number, firstTime = false): string {
  if (firstTime && months === 1) {
    return "1 Tháng đầu tiên";
  }
  return `${months} Tháng`;
}

export function formatPricePerMonth(priceVnd: number, months: number): string | undefined {
  if (months <= 1) {
    return undefined;
  }
  const perMonth = Math.round(priceVnd / months);
  return `chỉ ${perMonth.toLocaleString("vi-VN")} đ/tháng`;
}
