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
  ShoppingBag,
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
  { id: "store", href: "/dashboard/store", label: "Cửa hàng", icon: ShoppingBag },
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

export function isNavActive(pathname: string, href: string, allHrefs?: string[]) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  // Don't highlight a parent if a more specific sibling matches exactly
  if (allHrefs) {
    const moreSpecific = allHrefs.some((h) => h !== href && h.startsWith(`${href}/`) && pathname === h);
    if (moreSpecific) return false;
  }
  return true;
}
