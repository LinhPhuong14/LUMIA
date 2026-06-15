"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "lumia-upsell-banner-dismissed";

export function UpsellBanner({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!show || dismissed) {
    return null;
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-[24px] border border-honey/60 bg-[linear-gradient(135deg,var(--background),var(--champagne))] px-5 py-4">
      <p className="text-[13px] leading-6 text-matcha-deep">
        Đăng ký LUMIA để ngủ ngon hơn mỗi đêm -{" "}
        <Link href="/store" className="font-semibold underline">
          Xem các gói
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Đóng"
        className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-white/80"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
