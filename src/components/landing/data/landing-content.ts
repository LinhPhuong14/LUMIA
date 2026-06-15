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
  { href: "#goi-lumia", label: "Gói LUMIA" },
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
  imageSrc: string;
  imageAlt: string;
};

export const categoryCards: CategoryCard[] = [
  {
    title: "Ngủ sâu",
    subtitle: "Soundscape & sleep cast",
    icon: Moon,
    gradient: "var(--gradient-jade)",
    imageSrc: "/landing/categories/path-sleep.png",
    imageAlt: "Minh họa bé gái và chú chó đi trên đồng cỏ xanh — lối về giấc ngủ",
  },
  {
    title: "Thiền",
    subtitle: "Guided & mini meditation",
    icon: Sparkles,
    gradient: "var(--gradient-emerald)",
    imageSrc: "/landing/categories/path-meditation.png",
    imageAlt: "Minh họa bé gái thiền trên đồng cỏ — tĩnh lặng trong",
  },
  {
    title: "Hơi thở",
    subtitle: "4-7-8 & box breathing",
    icon: Wind,
    gradient: "var(--gradient-iris)",
    imageSrc: "/landing/categories/path-breath.png",
    imageAlt: "Minh họa bé gái hít thở cùng gió — từng nhịp thở",
  },
  {
    title: "Nhật ký",
    subtitle: "Viết ra, nhẹ lòng",
    icon: Feather,
    gradient: "var(--gradient-honeyjade)",
    imageSrc: "/landing/categories/path-journal.png",
    imageAlt: "Minh họa bé gái viết nhật ký trên đồng cỏ — viết ra và buông",
  },
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
  { id: 2, label: "Nghe", title: "Nghe sương rơi", copy: "Một soundscape ấm chọn riêng cho tối nay - mưa hiên, rừng đêm, hay sóng xa.", icon: Music },
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
  photoTier: "first_time" | "standard" | "plus" | "pro" | "premium" | "ultimate";
};

export const landingBoxCards: LandingBoxCard[] = [
  {
    name: "Standard",
    price: "129.000đ",
    per: "1 tháng",
    tagline: "Trải nghiệm tiêu chuẩn - linh hoạt theo tháng",
    blurb: "Gói nền tảng số cho ai muốn giữ nhịp chăm sóc đều mà vẫn tự do gia hạn từng tháng.",
    features: [
      "Premium không giới hạn: chat, journal, thư viện âm thanh",
      "AI cá nhân hóa không giới hạn",
      "Báo cáo mood & streak hàng tuần",
      "Hủy hoặc đổi gói bất cứ lúc nào",
    ],
    idealFor: "Bạn muốn trải nghiệm số thuần túy, không cần sản phẩm vật lý.",
    gradient: "var(--gradient-lime)",
    icon: Package,
    slug: "standard",
    badge: "Trải nghiệm số",
    photoTier: "standard",
  },
  {
    name: "Plus",
    price: "349.000đ",
    per: "3 tháng",
    tagline: "Lựa chọn thông minh - tiết kiệm hơn 10%",
    blurb: "Gói được chọn nhiều nhất: đủ thời gian xây thói quen tối mà vẫn nhẹ ví.",
    features: [
      "Mọi quyền lợi Standard trong 3 tháng",
      "Gia hạn tự động",
      "Lộ trình streak & mood 90 ngày",
      "Ưu tiên gợi ý nghi thức theo nhịp của bạn",
    ],
    idealFor: "Bạn muốn cam kết vài tháng để thấy thay đổi thật sự về giấc ngủ.",
    gradient: "var(--gradient-emerald)",
    icon: Leaf,
    slug: "plus",
    badge: "Tiết kiệm",
    photoTier: "plus",
  },
  {
    name: "Pro",
    price: "599.000đ",
    per: "6 tháng",
    tagline: "Tối ưu số - tiết kiệm hơn 22%",
    blurb: "Gói 6 tháng với phân tích dữ liệu chuyên sâu dài hạn - lựa chọn tiết kiệm nhất cho trải nghiệm số.",
    features: [
      "Premium 6 tháng đầy đủ",
      "Phân tích dữ liệu chuyên sâu dài hạn",
      "Báo cáo hành trình & mood theo quý",
      "AI không giới hạn",
    ],
    idealFor: "Bạn muốn theo dõi và cải thiện giấc ngủ bằng dữ liệu dài hạn.",
    gradient: "var(--gradient-jade)",
    icon: Sparkles,
    featured: true,
    slug: "pro",
    badge: "Gói số nâng cao",
    photoTier: "pro",
  },
  {
    name: "Premium",
    price: "699.000đ",
    per: "3 tháng",
    tagline: "App + Sleep Box - trải nghiệm trọn vẹn",
    blurb: "Kết hợp app Premium và đặc quyền Sleep Box - nến, trà, bịt mắt - gửi tận nhà.",
    features: [
      "Premium 3 tháng + Sleep Box giao tận nhà",
      "Nến thơm, trà thảo mộc, bịt mắt lụa",
      "Playlist wind-down được chọn theo mood",
      "Tiết kiệm hơn 15% cho combo",
    ],
    idealFor: "Bạn muốn kết hợp công nghệ và ritual vật lý cho giấc ngủ sâu.",
    gradient: "var(--gradient-honeyjade)",
    icon: Moon,
    slug: "premium",
    badge: "Đặc quyền vật lý",
    photoTier: "premium",
  },
  {
    name: "Ultimate",
    price: "1.199.000đ",
    per: "6 tháng",
    tagline: "Cao cấp nhất - kèm Master Box đầy đủ",
    blurb: "Gói 6 tháng cao cấp với đặc quyền Master Box - bộ công cụ đa giác quan hoàn chỉnh nhất.",
    features: [
      "Premium 6 tháng + Master Box phiên bản đầy đủ",
      "Báo cáo hành trình & mood chi tiết theo quý",
      "Bộ tinh dầu & xịt gối cao cấp",
      "Tiết kiệm hơn 20% cho combo",
    ],
    idealFor: "Bạn sẵn sàng đầu tư dài hạn cho sức khỏe tinh thần và giấc ngủ.",
    gradient: "var(--gradient-iris)",
    icon: Crown,
    slug: "ultimate",
    badge: "Cao cấp",
    photoTier: "ultimate",
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
  { title: "Gói LUMIA", links: ["Tất cả gói", "Gói Digital", "Gói Hệ sinh thái", "LUMIA Store", "Ưu đãi 99k"] },
  { title: "Về LUMIA", links: ["Cách đồng hành", "Cảm nhận", "Tạo tài khoản", "Đăng nhập"] },
  { title: "Hỗ trợ", links: ["Gói thành viên", "Tài khoản", "Cài đặt riêng tư", "Thanh toán"] },
] as const;
