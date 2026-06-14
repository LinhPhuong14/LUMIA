"use client";

import { MoonStar, Sun } from "lucide-react";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useLumiaTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition",
        className,
      )}
      style={{
        borderColor: "var(--glass-border)",
        background: "var(--glass-control)",
        color: "var(--foreground)",
      }}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <MoonStar className="h-[18px] w-[18px]" />}
    </button>
  );
}
