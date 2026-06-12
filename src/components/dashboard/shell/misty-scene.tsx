import { cn } from "@/lib/utils";

type Palette = {
  sky: string;
  glow: string;
  sun: string;
  far: string;
  mid: string;
  near: string;
  fog: string;
  forest: string;
};

const palettes: Record<"dawn" | "dusk", Palette> = {
  dawn: {
    sky: "linear-gradient(180deg, #fbe7c4 0%, #f7d9b0 32%, #f3cfa6 52%, #efe4cf 100%)",
    glow: "radial-gradient(60% 42% at 62% 30%, rgba(255,228,168,0.95) 0%, rgba(247,205,150,0.4) 45%, rgba(247,205,150,0) 75%)",
    sun: "radial-gradient(circle at 62% 30%, rgba(255,243,214,0.95) 0%, rgba(255,224,150,0.5) 22%, rgba(255,224,150,0) 55%)",
    far: "#e9c9a6",
    mid: "#dcb48f",
    near: "#c79b78",
    fog: "linear-gradient(180deg, rgba(252,240,221,0) 0%, rgba(252,240,221,0.85) 58%, rgba(252,240,221,0.98) 100%)",
    forest: "linear-gradient(180deg, rgba(120,138,100,0) 0%, rgba(95,111,82,0.55) 70%, rgba(70,85,58,0.7) 100%)",
  },
  dusk: {
    sky: "linear-gradient(180deg, #cdd6d3 0%, #c2cdcb 30%, #cfd7cf 55%, #e6e6da 100%)",
    glow: "radial-gradient(60% 42% at 40% 32%, rgba(232,238,226,0.9) 0%, rgba(196,211,196,0.35) 48%, rgba(196,211,196,0) 76%)",
    sun: "radial-gradient(circle at 40% 30%, rgba(244,246,238,0.85) 0%, rgba(214,224,210,0.4) 24%, rgba(214,224,210,0) 56%)",
    far: "#aebcb4",
    mid: "#94a79b",
    near: "#6f8475",
    fog: "linear-gradient(180deg, rgba(232,234,224,0) 0%, rgba(232,234,224,0.82) 56%, rgba(238,239,229,0.98) 100%)",
    forest: "linear-gradient(180deg, rgba(95,111,82,0) 0%, rgba(70,85,58,0.5) 72%, rgba(56,68,46,0.66) 100%)",
  },
};

function Ridge({
  color,
  clipPath,
  bottom,
  height,
  blur,
  opacity = 1,
}: {
  color: string;
  clipPath: string;
  bottom: string;
  height: string;
  blur: number;
  opacity?: number;
}) {
  return (
    <div
      className="absolute -inset-x-[6%]"
      style={{
        bottom,
        height,
        background: color,
        clipPath,
        filter: `blur(${blur}px)`,
        opacity,
      }}
      aria-hidden
    />
  );
}

export function MistyScene({
  variant = "dawn",
  className,
  children,
}: {
  variant?: "dawn" | "dusk";
  className?: string;
  children?: React.ReactNode;
}) {
  const p = palettes[variant];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ background: p.sky }}>
      <div className="absolute inset-0" style={{ background: p.glow }} aria-hidden />
      <div className="absolute inset-0" style={{ background: p.sun }} aria-hidden />
      <Ridge
        color={p.far}
        bottom="30%"
        height="46%"
        blur={7}
        opacity={0.7}
        clipPath="polygon(0 60%, 18% 30%, 34% 52%, 52% 18%, 70% 46%, 86% 26%, 100% 50%, 100% 100%, 0 100%)"
      />
      <Ridge
        color={p.mid}
        bottom="20%"
        height="42%"
        blur={5}
        opacity={0.85}
        clipPath="polygon(0 70%, 22% 40%, 40% 64%, 60% 32%, 78% 58%, 100% 38%, 100% 100%, 0 100%)"
      />
      <Ridge
        color={p.near}
        bottom="6%"
        height="40%"
        blur={3}
        clipPath="polygon(0 78%, 30% 52%, 50% 74%, 72% 46%, 100% 70%, 100% 100%, 0 100%)"
      />
      <div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: p.forest }} aria-hidden />
      <div className="absolute inset-0" style={{ background: p.fog }} aria-hidden />
      <div
        className="lumia-float-slow absolute left-[8%] top-[44%] h-[26px] w-[52%] rounded-full bg-white/50 blur-xl"
        aria-hidden
      />
      <div
        className="lumia-float-slow absolute right-[10%] top-[52%] h-5 w-[40%] rounded-full bg-white/45 blur-[11px]"
        style={{ animationDelay: "1.6s" }}
        aria-hidden
      />
      {children}
    </div>
  );
}
