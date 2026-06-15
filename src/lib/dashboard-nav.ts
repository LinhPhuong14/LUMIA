import type { Route } from "next";
import {
  Feather,
  Flame,
  MessageCircle,
  MessageSquareHeart,
  Moon,
  Music,
  Package,
  Route as RouteIcon,
  Settings,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  id: string;
  href: Route;
  label: string;
  icon: LucideIcon;
  mobileTab?: boolean;
  mobileLabel?: string;
};

export const desktopNav: DashboardNavItem[] = [
  { id: "hub", href: "/dashboard", label: "Hôm nay", icon: Sun },
  { id: "listen", href: "/ai", label: "Lắng nghe", icon: MessageCircle },
  { id: "journal", href: "/journal", label: "Nhật ký", icon: Feather },
  { id: "audio", href: "/audio", label: "Âm thanh", icon: Music },
  { id: "coach", href: "/audio/sleep", label: "Sleep Coach", icon: Moon },
  { id: "streak", href: "/journey", label: "Streak", icon: Flame },
  { id: "plan", href: "/account", label: "Gói", icon: Package },
  { id: "feedback", href: "/feedback", label: "Góp ý", icon: MessageSquareHeart },
  { id: "settings", href: "/settings", label: "Cài đặt", icon: Settings },
];

export const mobileTabs: DashboardNavItem[] = [
  { id: "tonight", href: "/dashboard", label: "Tối nay", mobileLabel: "Tối nay", icon: Moon, mobileTab: true },
  { id: "audio", href: "/audio", label: "Âm thanh", mobileLabel: "Âm thanh", icon: Music, mobileTab: true },
  { id: "listen", href: "/ai", label: "Lắng nghe", mobileLabel: "Lắng nghe", icon: MessageCircle, mobileTab: true },
  { id: "journey", href: "/journey", label: "Hành trình", mobileLabel: "Hành trình", icon: RouteIcon, mobileTab: true },
  { id: "you", href: "/account", label: "Bạn", mobileLabel: "Bạn", icon: User, mobileTab: true },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
