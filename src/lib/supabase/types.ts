export type UserRole = "user" | "admin";
export type OnboardingGoal =
  | "peace"
  | "sleep"
  | "habit"
  | "self_care"
  | "sharing"
  // Legacy values from the original enum, still present on older rows.
  | "stress"
  | "meditation";
export type SubscriptionStatus = "free" | "active" | "expired";
export type OrderStatus = "pending_payment" | "paid" | "preparing" | "shipping" | "delivered";
export type AudioCategory =
  | "sleep_sound"
  | "sleep_cast"
  | "wind_down"
  | "sleep_music"
  | "guided_meditation"
  | "breathing"
  | "timer_ambient"
  | "mini_meditation";
export type ActivityType = "mood" | "journal" | "audio" | "chat" | "breathing" | "timer";
export type ReportType = "weekly" | "full_21";

/** Answers collected in onboarding; editable later from the settings panel. */
export type OnboardingData = {
  motivation?: OnboardingGoal;
  bedtime?: string;
  sleepQuality?: number | null;
  recentMood?: string;
  companionMode?: string;
  /** Set by migration 025 for accounts backfilled after the enum bug. */
  autofilled?: boolean;
  source?: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  role: UserRole;
  onboarding_goal: OnboardingGoal | null;
  onboarding_data: OnboardingData | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  tier: string | null;
  started_at: string | null;
  expires_at: string | null;
  box_order_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payos_order_id: string | null;
  amount: number;
  tier: string | null;
  duration_months: number | null;
  has_physical_box: boolean;
  physical_box_type: string | null;
  created_at: string;
};

export type ProductTierRow = {
  id: string;
  name: string;
  slug: string;
  duration_months: number;
  price_vnd: number;
  has_physical_box: boolean;
  physical_box_type: string | null;
  box_contents: string[];
  features: string[];
  is_featured: boolean;
  is_first_time_only: boolean;
  discount_percent: number;
  sort_order: number;
};

export type AudioTrack = {
  id: string;
  title: string;
  description: string | null;
  category: AudioCategory;
  duration_seconds: number | null;
  file_url: string | null;
  thumbnail_url: string | null;
  is_free: boolean;
  sort_order: number;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  prompt_used: string | null;
  date: string;
  created_at: string;
};

export type MoodCheckin = {
  id: string;
  user_id: string;
  score: number;
  note: string | null;
  date: string;
  created_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type Report = {
  id: string;
  user_id: string;
  type: ReportType;
  content: Record<string, unknown>;
  period_start: string;
  period_end: string;
  created_at: string;
};
