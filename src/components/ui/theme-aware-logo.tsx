"use client";

import type { Route } from "next";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";

import { LumiaLogo } from "./logo";

export function ThemeAwareLogo({
  className,
  compact = false,
  href,
}: {
  className?: string;
  compact?: boolean;
  href?: Route;
}) {
  const { isDark } = useLumiaTheme();
  // light theme → dark ink logo; dark theme → cream logo
  return <LumiaLogo className={className} compact={compact} href={href} variant={isDark ? "light" : "dark"} key={isDark ? "dark" : "light"} />;
}
