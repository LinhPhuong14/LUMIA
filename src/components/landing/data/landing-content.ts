import {
  Crown,
  Feather,
  Flame,
  Gift,
  Home,
  Leaf,
  MessageCircle,
  Moon,
  Music,
  NotebookPen,
  Package,
  PenLine,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";

export const heroVideoSources = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4",
] as const;

export const ritualStageVideoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

export const navLinks = [
  { href: "#nghi-thuc", label: "Nghi thức" },
  { href: "#hop-lumia", label: "Hộp LUMIA" },
  { href: "#lang-nghe", label: "Lắng nghe" },
  { href: "#web-app", label: "Web app" },
  { href: "#cau-chuyen", label: "Câu chuyện" },
] as const;

export const heroStats = [
  { value: "21", label: "ngày hành trình" },
  { value: "150+", label: "soundscape" },
  { value: "74%", label: "ngủ ngon hơn" },
] as const;

export type CategoryCard = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
};

export const categoryCards: CategoryCard[] = [
  { title: "Ngủ sâu", subtitle: "Soundscape & sleep cast", icon: Moon, gradient: "var(--gradient-jade)" },
  { title: "Thiền", subtitle: "Guided & mini meditation", icon: Sparkles, gradient: "var(--gradient-emerald)" },
  { title: "Hơi thở", subtitle: "4-7-8 & box breathing", icon: Wind, gradient: "var(--gradient-iris)" },
  { title: "Nhật ký", subtitle: "Viết ra, nhẹ lòng", icon: Feather, gradient: "var(--gradient-honeyjade)" },
];

export type RitualStage = {
  id: number;
  label: string;
  title: string;
  copy: string;
  icon: LucideIcon;
};

export const ritualStages: RitualStage[] = [
  { id: 1, label: "Lắng", title: "Lắng lại", copy: "Bắt đầu bằng vài nhịp thở. Đặt điện thoại xuống, để cơ thể biết đã đến giờ nghỉ.", icon: Wind },
  { id: 2, label: "Nghe", title: "Nghe sương rơi", copy: "Một soundscape ấm chọn riêng cho tối nay — mưa hiên, rừng đêm, hay sóng xa.", icon: Music },
  { id: 3, label: "Viết", title: "Viết ra", copy: "Đặt cảm xúc xuống một chút. Không cần đúng sai, chỉ cần thật.", icon: Feather },
  { id: 4, label: "Thở", title: "Thở cùng vòng sáng", copy: "Bài thở 4-7-8 dẫn bạn vào tĩnh lặng, hơi thở chậm dần theo ánh sáng.", icon: Moon },
  { id: 5, label: "Ngủ", title: "Buông vào giấc", copy: "Khi cơ thể đã sẵn sàng, LUMIA mờ dần cùng bạn vào giấc ngủ sâu.", icon: Sparkles },
];

export type LandingBoxCard = {
  name: string;
  price: string;
  per: string;
  blurb: string;
  tagline: string;
  features: string[];
  idealFor: string;
  gradient: string;
  icon: LucideIcon;
  featured?: boolean;
  slug: string;
  badge?: string;
  photoTier: "first_time" | "standard" | "saver" | "sleep_well" | "master";
};

export const landingBoxCards: LandingBoxCard[] = [
  {
    name: "First-Time",
    price: "99.000đ",
    per: "1 tháng",
    tagline: "Bước đầu làm quen với nghi thức tối LUMIA",
    blurb: "Dành cho người mới — trải nghiệm đủ tính năng premium và nhận Mini Welcome Box chào đón.",
    features: [
      "Premium đầy đủ: AI lắng nghe, journal, soundscape",
      "Mini Welcome Box: trà thảo mộc & xịt gối thơm",
      "Hướng dẫn nghi thức 7 ngày đầu tiên",
      "Không cam kết dài hạn — thử nhẹ một tháng",
    ],
    idealFor: "Bạn mới biết LUMIA, muốn cảm nhận trước khi cam kết dài hơn.",
    gradient: "var(--gradient-jade)",
    icon: Gift,
    slug: "first-time-user",
    badge: "Người dùng mới",
    photoTier: "first_time",
  },
  {
    name: "Standard",
    price: "129.000đ",
    per: "1 tháng",
    tagline: "Linh hoạt theo tháng, không ràng buộc",
    blurb: "Gói cơ bản cho ai muốn giữ nhịp chăm sóc đều mà vẫn tự do gia hạn từng tháng.",
    features: [
      "Premium không giới hạn: chat, journal, thư viện âm thanh",
      "Ưu đãi 10% khi mua sản phẩm vật lý LUMIA",
      "Báo cáo mood & streak hàng tuần",
      "Hủy hoặc đổi gói bất cứ lúc nào",
    ],
    idealFor: "Bạn đã quen LUMIA và muốn linh hoạt, không cần hộp vật lý.",
    gradient: "var(--gradient-lime)",
    icon: Package,
    slug: "standard",
    badge: "Linh hoạt",
    photoTier: "standard",
  },
  {
    name: "Saver",
    price: "349.000đ",
    per: "3 tháng",
    tagline: "Tiết kiệm nhẹ — chỉ ~116.000đ/tháng",
    blurb: "Gói được chọn nhiều nhất: đủ thời gian xây thói quen tối mà vẫn nhẹ ví.",
    features: [
      "Mọi quyền lợi Standard trong 3 tháng",
      "Tiết kiệm ~27% so với gói tháng",
      "Lộ trình streak & mood 90 ngày",
      "Ưu tiên gợi ý nghi thức theo nhịp của bạn",
    ],
    idealFor: "Bạn muốn cam kết vài tháng để thấy thay đổi thật sự về giấc ngủ.",
    gradient: "var(--gradient-emerald)",
    icon: Leaf,
    featured: true,
    slug: "saver",
    badge: "Gói tiết kiệm",
    photoTier: "saver",
  },
  {
    name: "Sleep Well",
    price: "699.000đ",
    per: "3 tháng",
    tagline: "Kỹ thuật số + hộp vật lý cho giấc ngủ sâu",
    blurb: "Kết hợp app và Sleep Well Box — nến, trà, bịt mắt — để buổi tối có thêm một nghi thức chạm được.",
    features: [
      "Premium 3 tháng + Sleep Well Box giao tận nhà",
      "Nến thơm, trà thảo mộc, bịt mắt lụa cao cấp",
      "Playlist wind-down được chọn theo mood",
      "Hướng dẫn ritual 21 ngày kèm hộp",
    ],
    idealFor: "Bạn thích cảm giác mở hộp, thắp nến và tạo không gian ngủ riêng.",
    gradient: "var(--gradient-honeyjade)",
    icon: Moon,
    slug: "sleep-well",
    badge: "Kèm hộp vật lý",
    photoTier: "sleep_well",
  },
  {
    name: "Sleep Master",
    price: "1.199.000đ",
    per: "6 tháng",
    tagline: "Hành trình sâu nhất — kèm Master Box đầy đủ",
    blurb: "Gói cao cấp 6 tháng dành cho ai muốn biến buổi tối thành một nghi thức bền vững, có đồng hành trọn vẹn.",
    features: [
      "Premium 6 tháng + Master Box phiên bản đầy đủ nhất",
      "Báo cáo hành trình & mood chi tiết theo quý",
      "Ưu đãi 20% mua lại sản phẩm vật lý",
      "Quyền truy cập sớm soundscape & tính năng mới",
    ],
    idealFor: "Bạn sẵn sàng đầu tư dài hạn cho sức khỏe tinh thần và giấc ngủ.",
    gradient: "var(--gradient-iris)",
    icon: Crown,
    slug: "sleep-master",
    badge: "Cao cấp",
    photoTier: "master",
  },
];

export const statsTiles = [
  { n: "21", u: "ngày", l: "Hành trình ngủ sâu", grad: "var(--gradient-emerald)" },
  { n: "4M+", u: "phút", l: "Tĩnh lặng đã đi qua", grad: "var(--gradient-jade)" },
  { n: "150+", u: "bài", l: "Soundscape trong thư viện", grad: "var(--gradient-iris)" },
  { n: "74%", u: "", l: "Người dùng ngủ ngon hơn", grad: "var(--gradient-honeyjade)" },
] as const;

export type WebappPage = "hub" | "listen" | "journal" | "audio" | "streak";

export const webappPages: { id: WebappPage; label: string; icon: LucideIcon }[] = [
  { id: "hub", label: "Trang chủ", icon: Home },
  { id: "listen", label: "Lắng nghe", icon: MessageCircle },
  { id: "journal", label: "Nhật ký", icon: PenLine },
  { id: "audio", label: "Âm thanh", icon: Music },
  { id: "streak", label: "Streak", icon: Flame },
];

export type Testimonial = {
  quote: string;
  tag: string;
};

export const testimonials: Testimonial[] = [
  { quote: "Lần đầu tiên trong nhiều tháng mình ngủ được thật sự. Cái nghi thức nhỏ đó đã thay đổi cả buổi tối của mình.", tag: "Hộp Khởi đầu" },
  { quote: "Mình không ngờ là chỉ cần viết ra vài dòng mà lòng nhẹ đến vậy. LUMIA như người bạn không phán xét.", tag: "Workspace" },
  { quote: "Cái hộp đến tay mình vào đúng một tuần rất khó. Mình đã khóc và cảm ơn vì điều đó.", tag: "Hộp Dịu sâu" },
  { quote: "AI của LUMIA lắng nghe theo cách mình chưa từng thấy ở bất kỳ app nào. Nó không cố sửa mình.", tag: "LUMIA lắng nghe" },
  { quote: "Từ khi có LUMIA, buổi tối của mình có một cái neo. Mình biết mình sẽ dừng lại ở đâu đó trong ngày.", tag: "Hộp Mỗi ngày" },
  { quote: "Mình mua tặng bạn thân và nó nhắn lại rằng đó là món quà ý nghĩa nhất năm nay.", tag: "Hộp Quà tặng" },
  { quote: "Nhật ký LUMIA giúp mình nhìn lại cảm xúc theo tuần. Mình thấy rõ mình hơn rất nhiều.", tag: "Workspace" },
  { quote: "Hương thơm trong hộp, ánh nến nhỏ, những thứ tưởng vô nghĩa lại tạo ra sự khác biệt thật sự.", tag: "Hộp Dịu sâu" },
  { quote: "Mình đã từng nghĩ mình không cần được lắng nghe. Bây giờ mình biết mình đã sai.", tag: "LUMIA lắng nghe" },
];

export const footerColumns = [
  { title: "Hộp LUMIA", links: ["Tất cả sản phẩm", "Hộp Khởi đầu", "Hộp Mỗi ngày", "Hộp Dịu sâu", "Hộp Quà tặng"] },
  { title: "Về LUMIA", links: ["Cách đồng hành", "Cảm nhận", "Tạo tài khoản", "Đăng nhập"] },
  { title: "Hỗ trợ", links: ["Mua hộp LUMIA", "Tài khoản", "Cài đặt riêng tư", "Thanh toán"] },
] as const;
