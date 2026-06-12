"use client";

import { Moon } from "lucide-react";

function Shard({
  className,
  style,
  gradient,
}: {
  className?: string;
  style?: React.CSSProperties;
  gradient: string;
}) {
  return (
    <div
      className={`animate-float-slow absolute rounded-[42%_58%_56%_44%/50%_44%_56%_50%] ${className ?? ""}`}
      style={{
        background: gradient,
        boxShadow:
          "inset 4px 4px 12px rgba(255,255,255,0.6), inset -6px -6px 16px rgba(44,122,82,0.4), 0 16px 36px rgba(47,122,82,0.22)",
        ...style,
      }}
      aria-hidden
    />
  );
}

export function GlassBlob({ size = 420 }: { size?: number }) {
  const iconSize = Math.round(size * 0.3);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-[-12%] rounded-full blur-[20px]"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(150,195,141,0.4), transparent 65%)",
        }}
        aria-hidden
      />
      <div className="lumia-glass-blob lumia-grain absolute inset-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <Moon size={iconSize} strokeWidth={1} className="text-white/90" />
        </div>
        <div
          className="absolute left-[20%] top-[16%] h-[22%] w-[30%] rounded-full blur-[3px]"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)",
          }}
          aria-hidden
        />
      </div>
      <Shard
        gradient="var(--gradient-jade)"
        className="right-[8%] top-[4%]"
        style={{ width: 64, height: 64, animationDelay: "0s" }}
      />
      <Shard
        gradient="var(--gradient-lime)"
        className="bottom-[10%] left-0"
        style={{ width: 84, height: 84, animationDelay: "1.4s" }}
      />
      <Shard
        gradient="var(--gradient-emerald)"
        className="bottom-[2%] right-[20%]"
        style={{ width: 46, height: 46, animationDelay: "2.2s" }}
      />
    </div>
  );
}
