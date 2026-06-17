import type { Route } from "next";
import {
  Feather,
  Flame,
  MessageCircle,
  Moon,
  Music,
  Route as RouteIcon,
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
  { id: "streak", href: "/journey", label: "Hành trình", icon: Flame },
  { id: "store", href: "/dashboard/store" as Route, label: "Cửa hàng", icon: ShoppingBag },
  { id: "plan", href: "/account", label: "Tôi", icon: User },
];

export const mobileTabs: DashboardNavItem[] = [
  { id: "tonight", href: "/dashboard", label: "Tối nay", mobileLabel: "Tối nay", icon: Moon, mobileTab: true },
  { id: "audio", href: "/audio", label: "Âm thanh", mobileLabel: "Âm thanh", icon: Music, mobileTab: true },
  { id: "journal", href: "/journal", label: "Nhật ký", mobileLabel: "Nhật ký", icon: Feather, mobileTab: true },
  { id: "journey", href: "/journey", label: "Hành trình", mobileLabel: "Hành trình", icon: RouteIcon, mobileTab: true },
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
