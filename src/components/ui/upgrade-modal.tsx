"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";

const BENEFITS = [
  "Toàn bộ thư viện thiền định & nhạc ngủ",
  "Sleep Cast, Wind Down và nội dung độc quyền",
  "Bài tập thở và hẹn giờ thiền",
  "Nội dung mới cập nhật mỗi tuần",
];

export function UpgradeModal({
  open,
  onClose,
  trackTitle,
  featureName = "Nội dung này",
}: {
  open: boolean;
  onClose: () => void;
  trackTitle?: string | null;
  featureName?: string;
}) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
          >
            {/* Accent header */}
            <div
              className="relative px-6 pt-7 pb-5 sm:px-7"
              style={{
                background:
                  "radial-gradient(120% 120% at 0% 0%, var(--green-wash) 0%, transparent 60%)",
              }}
            >
              <button
                type="button"
                aria-label="Đóng"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_12px_28px_rgba(141,157,118,0.35)]"
                style={{ background: "var(--gradient-jade, linear-gradient(135deg,#8d9d76,#5f7050))" }}
              >
                <Sparkles className="h-6 w-6" />
              </div>

              <span className="mt-4 inline-flex items-center rounded-full border border-[var(--green)]/30 bg-[var(--green-wash)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green-deep)]">
                LUMIA Premium
              </span>

              <h2
                id="upgrade-modal-title"
                className="mt-3 font-sans text-lg font-semibold leading-snug text-[var(--foreground)] sm:text-xl"
              >
                Mở khóa toàn bộ thư viện Premium
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {trackTitle
                  ? <>“{trackTitle}” dành cho thành viên Premium. Đăng ký để nghe ngay và mở khóa mọi nội dung.</>
                  : <>{featureName} dành cho thành viên Premium. Đăng ký để mở khóa toàn bộ trải nghiệm LUMIA.</>}
              </p>
            </div>

            {/* Benefits */}
            <div className="px-6 pb-2 sm:px-7">
              <ul className="space-y-2.5">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[13px] text-[var(--foreground)]">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--green-wash)] text-[var(--green-deep)]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 px-6 pb-6 pt-5 sm:px-7">
              <Link
                href="/store"
                className="button-primary w-full justify-center text-center text-[14px]"
                onClick={onClose}
              >
                Xem các gói LUMIA
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full px-4 py-2.5 text-[13px] font-medium text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--foreground)]"
              >
                Để sau
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
