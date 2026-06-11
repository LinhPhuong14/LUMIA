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
    <div className="mb-4 flex items-center justify-between gap-4 rounded-[24px] border border-[#F4D878]/60 bg-[linear-gradient(135deg,#FFFDF5,#FFF3C7)] px-5 py-4">
      <p className="text-[13px] leading-6 text-matcha-deep">
        Mở khóa 21 ngày thiền và ngủ ngon —{" "}
        <Link href="/boxes" className="font-semibold underline">
          Xem hộp LUMIA
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
