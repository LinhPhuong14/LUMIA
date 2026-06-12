/* LUMIA landing — shared helpers: Icon (lucide), GlassBlob hero object,
   floating glass shards, frosted nav pill. */

function Icon({ name, size = 20, strokeWidth = 1.75, color = "currentColor", style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({ attrs: { width: size, height: size, "stroke-width": strokeWidth, stroke: color } });
    }
  }, [name, size, strokeWidth, color]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", ...style }} />;
}

/* The hero glass droplet — layered iridescent glass with inner highlights,
   a floating moon glyph, and orbiting glass shards. Pure CSS, no images. */
function GlassBlob({ size = 440 }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* soft cast glow */}
      <div style={{ position: "absolute", inset: "-12%", borderRadius: "50%", background: "radial-gradient(circle at 50% 45%, rgba(150,195,141,0.4), transparent 65%)", filter: "blur(20px)" }} />
      {/* main blob */}
      <div className="lumia-glass-blob lumia-grain" style={{ position: "absolute", inset: 0 }}>
        {/* crescent inside */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="moon" size={size * 0.3} color="rgba(255,255,255,0.92)" strokeWidth={1} />
        </div>
        {/* specular highlight */}
        <div style={{ position: "absolute", top: "16%", left: "20%", width: "30%", height: "22%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)", filter: "blur(3px)" }} />
      </div>
      {/* orbiting glass shards */}
      <Shard style={{ top: "4%", right: "8%", width: 64, height: 64 }} delay="0s" grad="var(--gradient-jade)" />
      <Shard style={{ bottom: "10%", left: "0%", width: 84, height: 84 }} delay="1.4s" grad="var(--gradient-lime)" />
      <Shard style={{ bottom: "2%", right: "20%", width: 46, height: 46 }} delay="2.2s" grad="var(--gradient-emerald)" />
    </div>
  );
}
function Shard({ style, delay, grad }) {
  return (
    <div className="lumia-animate-float-slow" style={{ position: "absolute", borderRadius: "42% 58% 56% 44% / 50% 44% 56% 50%", background: grad,
      boxShadow: "inset 4px 4px 12px rgba(255,255,255,0.6), inset -6px -6px 16px rgba(44,122,82,0.4), 0 16px 36px rgba(47,122,82,0.22)",
      animationDelay: delay, ...style }} />
  );
}

Object.assign(window, { Icon, GlassBlob, Shard });
