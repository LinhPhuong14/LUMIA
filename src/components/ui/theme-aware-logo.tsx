"use client";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";

import { LumiaLogo } from "./logo";

export function ThemeAwareLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { isDark } = useLumiaTheme();
  // light theme → dark ink logo; dark theme → cream logo
  return <LumiaLogo className={className} compact={compact} variant={isDark ? "light" : "dark"} key={isDark ? "dark" : "light"} />;
}
