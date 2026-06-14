import { cn } from "@/lib/utils";

const RIDGE_FAR_CLIP =
  "polygon(0 60%, 18% 30%, 34% 52%, 52% 18%, 70% 46%, 86% 26%, 100% 50%, 100% 100%, 0 100%)";
const RIDGE_MID_CLIP =
  "polygon(0 70%, 22% 40%, 40% 64%, 60% 32%, 78% 58%, 100% 38%, 100% 100%, 0 100%)";
const RIDGE_NEAR_CLIP =
  "polygon(0 78%, 30% 52%, 50% 74%, 72% 46%, 100% 70%, 100% 100%, 0 100%)";

function Ridge({
  colorVar,
  clipPath,
  bottom,
  height,
  blur,
  opacity,
}: {
  colorVar: string;
  clipPath: string;
  bottom: string;
  height: string;
  blur: number;
  opacity: number;
}) {
  return (
    <div
      className="misty-scene__ridge"
      style={
        {
          "--ridge-color": colorVar,
          "--ridge-clip": clipPath,
          "--ridge-blur": `${blur}px`,
          "--ridge-opacity": opacity,
          bottom,
          height,
        } as React.CSSProperties
      }
      aria-hidden
    />
  );
}

export function MistyScene({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("misty-scene", className)}>
      <div className="misty-scene__layer misty-scene__stars" aria-hidden />
      <div className="misty-scene__layer misty-scene__glow" aria-hidden />
      <div className="misty-scene__layer misty-scene__sun" aria-hidden />
      <Ridge
        colorVar="var(--scene-ridge-far)"
        bottom="30%"
        height="46%"
        blur={7}
        opacity={0.7}
        clipPath={RIDGE_FAR_CLIP}
      />
      <Ridge
        colorVar="var(--scene-ridge-mid)"
        bottom="20%"
        height="42%"
        blur={5}
        opacity={0.85}
        clipPath={RIDGE_MID_CLIP}
      />
      <Ridge
        colorVar="var(--scene-ridge-near)"
        bottom="6%"
        height="40%"
        blur={3}
        opacity={1}
        clipPath={RIDGE_NEAR_CLIP}
      />
      <div className="misty-scene__forest" aria-hidden />
      <div className="misty-scene__layer misty-scene__fog" aria-hidden />
      <div
        className="misty-scene__float lumia-float-slow left-[8%] top-[44%] h-[26px] w-[52%]"
        aria-hidden
      />
      <div
        className="misty-scene__float lumia-float-slow right-[10%] top-[52%] h-5 w-[40%] blur-[11px]"
        style={{ animationDelay: "1.6s" }}
        aria-hidden
      />
      {children}
    </div>
  );
}
