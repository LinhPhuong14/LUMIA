"use client";

import { cn } from "@/lib/utils";

export interface TabPillsItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export function TabPills({
  tabs,
  activeTab,
  onChange,
  fullWidth = false,
  className,
}: {
  tabs: TabPillsItem[];
  activeTab: string;
  onChange: (id: string) => void;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        fullWidth ? "mobile-segmented w-full" : "inline-flex rounded-full border border-white/70 bg-white/84 p-1 shadow-sm",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              fullWidth
                ? "mobile-segmented-item"
                : "rounded-full px-5 py-2 text-sm font-medium transition",
              fullWidth
                ? active
                  ? "mobile-segmented-item-active"
                  : "mobile-segmented-item-inactive"
                : active
                  ? "bg-matcha text-white"
                  : "text-muted hover:text-foreground",
              tab.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
