"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function FloatingChatBubble() {
  const pathname = usePathname();

  // Hide on the AI chat page itself
  if (pathname === "/ai" || pathname.startsWith("/ai/")) return null;

  return (
    <div className="fixed bottom-[calc(104px+env(safe-area-inset-bottom,0px))] right-4 z-40 lg:hidden">
      <Link
        href="/ai"
        aria-label="Lắng nghe cùng LUMIA"
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition active:scale-90"
        style={{ background: "var(--gradient-primary)" }}
      >
        {/* Pulse ring */}
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-30"
          style={{ background: "var(--green)" }}
        />
        <MessageCircle className="relative h-[22px] w-[22px] text-white" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
