export type TierCode = "first_time" | "standard" | "plus" | "pro" | "premium" | "ultimate";

export type PhysicalBoxType = "mini_wellcome" | "sleep_box" | "master_box";

/** Legacy tier IDs stored in older orders/subscriptions */
const LEGACY_TIER_ALIASES: Record<string, TierCode> = {
  saver: "plus",
  sleep_well: "premium",
  master: "ultimate",
};

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
  group: "digital" | "hybrid" | "promo";
};

const premiumFeatures = [
  "Truy cập toàn bộ tính năng Premium",
  "AI cá nhân hóa không giới hạn",
] as const;

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
    features: [...premiumFeatures, "Welcome Kit: trà thảo mộc + xịt gối mini"],
    isFeatured: false,
    isFirstTimeOnly: true,
    discountPercent: 0,
    sortOrder: 0,
    group: "promo",
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
    features: [...premiumFeatures],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 0,
    sortOrder: 1,
    group: "digital",
  },
  {
    id: "plus",
    name: "LUMIA PLUS",
    slug: "plus",
    durationMonths: 3,
    priceVnd: 349_000,
    hasPhysicalBox: false,
    physicalBoxType: null,
    boxContents: [],
    features: [...premiumFeatures, "Gia hạn tự động"],
    isFeatured: true,
    isFirstTimeOnly: false,
    discountPercent: 10,
    sortOrder: 2,
    group: "digital",
  },
  {
    id: "pro",
    name: "LUMIA PRO",
    slug: "pro",
    durationMonths: 6,
    priceVnd: 599_000,
    hasPhysicalBox: false,
    physicalBoxType: null,
    boxContents: [],
    features: [...premiumFeatures, "Phân tích dữ liệu chuyên sâu dài hạn"],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 22,
    sortOrder: 3,
    group: "digital",
  },
  {
    id: "premium",
    name: "LUMIA PREMIUM",
    slug: "premium",
    durationMonths: 3,
    priceVnd: 699_000,
    hasPhysicalBox: true,
    physicalBoxType: "sleep_box",
    boxContents: ["1 Hũ nến thơm", "1 Hộp trà thảo mộc", "1 Bịt mắt lụa"],
    features: [...premiumFeatures, "Tặng kèm đặc quyền Sleep Box"],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 15,
    sortOrder: 4,
    group: "hybrid",
  },
  {
    id: "ultimate",
    name: "LUMIA ULTIMATE",
    slug: "ultimate",
    durationMonths: 6,
    priceVnd: 1_199_000,
    hasPhysicalBox: true,
    physicalBoxType: "master_box",
    boxContents: [
      "1 Hũ nến thơm",
      "1 Hộp trà thảo mộc",
      "1 Bịt mắt lụa",
      "1 Bộ tinh dầu",
      "1 Xịt gối",
    ],
    features: [...premiumFeatures, "Tặng kèm đặc quyền Master Box"],
    isFeatured: false,
    isFirstTimeOnly: false,
    discountPercent: 20,
    sortOrder: 5,
    group: "hybrid",
  },
];

export function resolveTierCode(value: string): TierCode | undefined {
  if (PRODUCT_TIERS.some((t) => t.id === value)) {
    return value as TierCode;
  }
  return LEGACY_TIER_ALIASES[value];
}

export function getProductTier(code: string): ProductTier {
  const resolved = resolveTierCode(code);
  const tier = resolved ? PRODUCT_TIERS.find((t) => t.id === resolved) : undefined;
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
  return resolveTierCode(value) !== undefined;
}

export function getDigitalTiers(): ProductTier[] {
  return PRODUCT_TIERS.filter((t) => t.group === "digital");
}

export function getHybridTiers(): ProductTier[] {
  return PRODUCT_TIERS.filter((t) => t.group === "hybrid");
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

export function formatSavingsLabel(discountPercent: number): string | undefined {
  if (discountPercent <= 0) {
    return undefined;
  }
  return `Tiết kiệm hơn ${discountPercent}%`;
}
