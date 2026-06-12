"use client";

import { motion } from "framer-motion";

type BotanicalVariant = "leaves" | "orb" | "branch";

export function BotanicalOrb({
  variant = "orb",
  size = 120,
  opacity = 0.3,
  animate = true,
  className = "",
}: {
  variant?: BotanicalVariant;
  size?: number;
  opacity?: number;
  animate?: boolean;
  className?: string;
}) {
  const style = { width: size, height: size, opacity };

  if (variant === "orb") {
    const content = (
      <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
        <defs>
          <radialGradient id="botOrb">
            <stop offset="0%" stopColor="#eaf0df" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#d2dcba" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7d8f68" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#botOrb)" />
      </svg>
    );
    if (!animate) return content;
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {content}
      </motion.div>
    );
  }

  if (variant === "leaves") {
    return (
      <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
        <path d="M40 8 C30 25 20 35 15 50 C25 42 35 40 40 45 C45 30 55 20 65 10 C55 18 48 28 40 8Z" fill="#7d8f68" opacity="0.6" />
        <path d="M25 55 C20 65 18 72 12 78 C22 70 28 68 32 72 C34 62 38 55 25 55Z" fill="#d2dcba" opacity="0.5" transform="rotate(-20 25 55)" />
        <path d="M55 50 C60 62 65 70 72 76 C62 68 56 66 52 70 C50 58 48 50 55 50Z" fill="#8d9d76" opacity="0.45" transform="rotate(15 55 50)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 60" className={className} style={style} aria-hidden>
      <path d="M5 45 Q30 20 55 35 T95 25" stroke="#7d8f68" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="30" cy="30" r="3" fill="#d2dcba" opacity="0.7" />
      <circle cx="55" cy="35" r="2.5" fill="#8d9d76" opacity="0.6" />
      <circle cx="75" cy="28" r="2" fill="#eaf0df" opacity="0.8" />
      <path d="M25 32 C22 28 20 24 18 20 C24 26 28 28 25 32Z" fill="#7d8f68" opacity="0.4" />
      <path d="M60 33 C63 28 66 24 70 20 C64 26 60 28 60 33Z" fill="#7d8f68" opacity="0.4" />
    </svg>
  );
}

export function FloatingLeaf({
  delay = 0,
  duration = 8,
  className = "",
}: {
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        y: [0, -30, 0],
        x: [0, 10, -5, 0],
        rotate: [0, 15, -10, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8 8 5 12 4 18c3-1 5-1 8 1 1-5 3-9 8-15-3 3-5 6-5 9s1 6 4 9c-1-4-1-8 0-12z"
          fill="#7d8f68"
          opacity="0.5"
        />
      </svg>
    </motion.div>
  );
}
