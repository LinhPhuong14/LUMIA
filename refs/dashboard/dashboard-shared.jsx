/* LUMIA dashboard — shared chrome: Icon, Sidebar, TopBar, Panel, Kicker. */

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

const DASH_NAV = [
  { id: "hub", label: "Hôm nay", icon: "sun" },
  { id: "listen", label: "Lắng nghe", icon: "message-circle" },
  { id: "journal", label: "Nhật ký", icon: "feather" },
  { id: "audio", label: "Âm thanh", icon: "music" },
  { id: "coach", label: "Sleep Coach", icon: "moon" },
  { id: "streak", label: "Streak & huy hiệu", icon: "flame" },
  { id: "plan", label: "Gói của tôi", icon: "package" },
];

function Sidebar({ active, onNav }) {
  return (
    <aside className="lumia-grain-soft" style={{ position: "relative", zIndex: 1, width: 250, flexShrink: 0, borderRadius: 30, padding: 20, display: "flex", flexDirection: "column", margin: 16, marginRight: 0,
      background: "rgba(255,255,255,0.58)", backdropFilter: "blur(24px) saturate(1.3)", WebkitBackdropFilter: "blur(24px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 18px 44px rgba(122,140,82,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 18px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--gradient-emerald)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="moon" size={16} color="#fff" /></div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: "var(--green-deep)", letterSpacing: "-0.01em" }}>lumia</span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {DASH_NAV.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              display: "flex", alignItems: "center", gap: 12, borderRadius: 16, padding: "11px 14px", border: "none", textAlign: "left", cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: on ? 600 : 500,
              color: on ? "var(--green-deep)" : "var(--muted)",
              background: on ? "linear-gradient(140deg, rgba(255,255,255,0.95), var(--green-wash))" : "transparent",
              boxShadow: on ? "0 10px 24px rgba(122,140,82,0.12)" : "none",
            }}>
              <Icon name={it.icon} size={18} color={on ? "var(--green-deep)" : "var(--muted)"} strokeWidth={on ? 2 : 1.7} />
              {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 16, background: "rgba(255,255,255,0.5)" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gradient-jade)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 700, color: "#fff", fontSize: 13 }}>L</div>
        <div style={{ lineHeight: 1.25, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Linh Nguyễn</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Deep Ritual</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, sub }) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px 20px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.02em" }}>{title}</h1>
        {sub ? <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>{sub}</p> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ width: 42, height: 42, borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="bell" size={18} color="var(--muted)" /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-card)", padding: "6px 8px 6px 14px" }}>
          <Icon name="crown" size={14} color="var(--honey-dark)" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--green-deep)" }}>Deep Ritual</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gradient-jade)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 700, color: "#fff", fontSize: 12 }}>L</div>
        </div>
      </div>
    </header>
  );
}

/* Panel — the standard dashboard card. Frosted glass (translucent + blur) so
   the background glow peeks through, softly raised, with a faint noise texture
   and generous padding. Flex column so the body can stretch to fill tall rows. */
function Panel({ title, action, children, pad = 28, style = {} }) {
  return (
    <section className="lumia-grain-soft" style={{ position: "relative", borderRadius: 26, padding: pad, display: "flex", flexDirection: "column",
      background: "rgba(255,255,255,0.6)", backdropFilter: "blur(22px) saturate(1.3)", WebkitBackdropFilter: "blur(22px) saturate(1.3)",
      border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 18px 44px rgba(122,140,82,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", ...style }}>
      {(title || action) ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {title ? <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--foreground)" }}>{title}</h3> : <span />}
          {action || null}
        </div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div>
    </section>
  );
}

const dashKicker = { fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--green)" };
const dashPageWrap = { display: "flex", flexDirection: "column", gap: 18, flex: 1, minHeight: 0 };

Object.assign(window, { Icon, Sidebar, TopBar, Panel, dashKicker, dashPageWrap });
