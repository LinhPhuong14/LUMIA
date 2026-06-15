"use client";

import { useState } from "react";

type Props = {
  description?: string;
  ingredients?: string;
  usageGuide?: string;
  safetyNotes?: string;
  storageInfo?: string;
  dimensions?: string;
  origin?: string;
  manufacturer?: string;
  expiryMonths?: number;
};

type TabKey = "description" | "ingredients" | "usage" | "notes";

function parseNumberedSteps(text: string): string[] | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const numbered = lines.filter((l) => /^\d+\./.test(l));
  if (numbered.length >= 2) return numbered;
  return null;
}

export function StoreProductTabs({
  description,
  ingredients,
  usageGuide,
  safetyNotes,
  storageInfo,
  dimensions,
  origin,
  manufacturer,
  expiryMonths,
}: Props) {
  const hasIngredients = !!(ingredients || expiryMonths);
  const hasUsage = !!usageGuide;
  const hasNotes = !!(safetyNotes || storageInfo || dimensions || origin || manufacturer);

  const tabs: { key: TabKey; label: string; visible: boolean }[] = [
    { key: "description", label: "Mô tả", visible: !!description },
    { key: "ingredients", label: "Thành phần", visible: hasIngredients },
    { key: "usage", label: "Hướng dẫn", visible: hasUsage },
    { key: "notes", label: "Lưu ý", visible: hasNotes },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);
  const [active, setActive] = useState<TabKey>(visibleTabs[0]?.key ?? "description");

  if (visibleTabs.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-[var(--border)]">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={[
              "px-4 py-2 text-sm font-medium transition",
              active === tab.key
                ? "border-b-2 border-[var(--green)] text-[var(--green)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 text-sm leading-7 text-[var(--foreground)]">
        {active === "description" && description && (
          <p className="whitespace-pre-line">{description}</p>
        )}

        {active === "ingredients" && (
          <div className="space-y-3">
            {ingredients && <p className="whitespace-pre-line">{ingredients}</p>}
            {expiryMonths && (
              <p className="text-[var(--muted)]">
                HSD: <span className="font-medium text-[var(--foreground)]">{expiryMonths} tháng</span>
              </p>
            )}
          </div>
        )}

        {active === "usage" && usageGuide && (() => {
          const steps = parseNumberedSteps(usageGuide);
          if (steps) {
            return (
              <ol className="list-decimal space-y-2 pl-5">
                {steps.map((step, i) => (
                  <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
                ))}
              </ol>
            );
          }
          return <p className="whitespace-pre-line">{usageGuide}</p>;
        })()}

        {active === "notes" && (
          <div className="space-y-4">
            {safetyNotes && (
              <div>
                <p className="mb-1 font-medium">Lưu ý an toàn</p>
                <p className="whitespace-pre-line text-[var(--muted)]">{safetyNotes}</p>
              </div>
            )}
            {storageInfo && (
              <div>
                <p className="mb-1 font-medium">Bảo quản</p>
                <p className="whitespace-pre-line text-[var(--muted)]">{storageInfo}</p>
              </div>
            )}
            {(dimensions || origin || manufacturer) && (
              <dl className="space-y-2">
                {dimensions && (
                  <div className="flex gap-3">
                    <dt className="w-32 text-[var(--muted)]">Kích thước</dt>
                    <dd>{dimensions}</dd>
                  </div>
                )}
                {origin && (
                  <div className="flex gap-3">
                    <dt className="w-32 text-[var(--muted)]">Xuất xứ</dt>
                    <dd>{origin}</dd>
                  </div>
                )}
                {manufacturer && (
                  <div className="flex gap-3">
                    <dt className="w-32 text-[var(--muted)]">Nhà sản xuất</dt>
                    <dd>{manufacturer}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
