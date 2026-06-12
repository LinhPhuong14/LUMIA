/* LUMIA mobile — atmospheric "misty mountain" scenes, built from layered CSS
   gradients + soft blurred ridge silhouettes. No photos needed; evokes the
   dawn/dusk healing mood of the reference. Two brand-tuned palettes. */

const SCENE_PALETTES = {
  // Warm honey dawn
  dawn: {
    sky: "linear-gradient(180deg, #fbe7c4 0%, #f7d9b0 32%, #f3cfa6 52%, #efe4cf 100%)",
    glow: "radial-gradient(60% 42% at 62% 30%, rgba(255,228,168,0.95) 0%, rgba(247,205,150,0.4) 45%, rgba(247,205,150,0) 75%)",
    sun: "radial-gradient(circle at 62% 30%, rgba(255,243,214,0.95) 0%, rgba(255,224,150,0.5) 22%, rgba(255,224,150,0) 55%)",
    far: "#e9c9a6", mid: "#dcb48f", near: "#c79b78",
    fog: "linear-gradient(180deg, rgba(252,240,221,0) 0%, rgba(252,240,221,0.85) 58%, rgba(252,240,221,0.98) 100%)",
    forest: "linear-gradient(180deg, rgba(120,138,100,0) 0%, rgba(95,111,82,0.55) 70%, rgba(70,85,58,0.7) 100%)",
  },
  // Cool sage dusk
  dusk: {
    sky: "linear-gradient(180deg, #cdd6d3 0%, #c2cdcb 30%, #cfd7cf 55%, #e6e6da 100%)",
    glow: "radial-gradient(60% 42% at 40% 32%, rgba(232,238,226,0.9) 0%, rgba(196,211,196,0.35) 48%, rgba(196,211,196,0) 76%)",
    sun: "radial-gradient(circle at 40% 30%, rgba(244,246,238,0.85) 0%, rgba(214,224,210,0.4) 24%, rgba(214,224,210,0) 56%)",
    far: "#aebcb4", mid: "#94a79b", near: "#6f8475",
    fog: "linear-gradient(180deg, rgba(232,234,224,0) 0%, rgba(232,234,224,0.82) 56%, rgba(238,239,229,0.98) 100%)",
    forest: "linear-gradient(180deg, rgba(95,111,82,0) 0%, rgba(70,85,58,0.5) 72%, rgba(56,68,46,0.66) 100%)",
  },
};

// A soft blurred mountain ridge.
function Ridge({ color, clip, bottom, height, blur, opacity = 1 }) {
  return (
    <div style={{
      position: "absolute", left: "-6%", right: "-6%", bottom, height,
      background: color, clipPath: clip,
      filter: `blur(${blur}px)`, opacity,
    }} />
  );
}

function MistyScene({ variant = "dawn", children, style = {} }) {
  const p = SCENE_PALETTES[variant] || SCENE_PALETTES.dawn;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: p.sky, ...style }}>
      <div style={{ position: "absolute", inset: 0, background: p.glow }} />
      <div style={{ position: "absolute", inset: 0, background: p.sun }} />
      {/* ridges, far → near */}
      <Ridge color={p.far} bottom="30%" height="46%" blur={7} opacity={0.7}
        clip="polygon(0 60%, 18% 30%, 34% 52%, 52% 18%, 70% 46%, 86% 26%, 100% 50%, 100% 100%, 0 100%)" />
      <Ridge color={p.mid} bottom="20%" height="42%" blur={5} opacity={0.85}
        clip="polygon(0 70%, 22% 40%, 40% 64%, 60% 32%, 78% 58%, 100% 38%, 100% 100%, 0 100%)" />
      <Ridge color={p.near} bottom="6%" height="40%" blur={3}
        clip="polygon(0 78%, 30% 52%, 50% 74%, 72% 46%, 100% 70%, 100% 100%, 0 100%)" />
      {/* forest / lake foreground */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: p.forest }} />
      {/* fog band */}
      <div style={{ position: "absolute", inset: 0, background: p.fog }} />
      {/* a couple of drifting cloud wisps */}
      <div className="lumia-animate-float-slow" style={{ position: "absolute", top: "44%", left: "8%", width: "52%", height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.5)", filter: "blur(12px)" }} />
      <div className="lumia-animate-float-slow" style={{ position: "absolute", top: "52%", right: "10%", width: "40%", height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.45)", filter: "blur(11px)", animationDelay: "1.6s" }} />
      {children}
    </div>
  );
}

Object.assign(window, { MistyScene });
