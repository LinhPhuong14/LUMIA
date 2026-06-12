/* LUMIA landing — top nav + hero (grainy green aura + glass blob + LOIK glass). */
const { Button: LPButton } = window.LUMIADesignSystem_b26f27;

const LP_NAV = [
  { t: "Nghi thức", href: "#nghi-thuc" },
  { t: "Hộp LUMIA", href: "#hop-lumia" },
  { t: "Lắng nghe", href: "#lang-nghe" },
  { t: "Web app", href: "#web-app" },
  { t: "Câu chuyện", href: "#cau-chuyen" },
];

function LandingNav() {
  return (
    <div style={{ position: "sticky", top: 16, zIndex: 60, display: "flex", justifyContent: "center", padding: "0 24px" }}>
      <div className="lumia-glass" style={{ borderRadius: 999, display: "flex", alignItems: "center", gap: 30, padding: "9px 12px 9px 24px", width: "min(1080px, 100%)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--green-deep)" }}>lumia</span>
        <nav style={{ display: "flex", gap: 26, flex: 1 }}>
          {LP_NAV.map((n) => (
            <a key={n.t} href={n.href} style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--muted)", whiteSpace: "nowrap" }}>{n.t}</a>
          ))}
        </nav>
        <a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--green-deep)" }}>Đăng nhập</a>
        <button style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "11px 22px", background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(63,158,110,0.34)" }}>Bắt đầu</button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="lumia-aura lumia-grain" style={{ position: "relative", overflow: "hidden", paddingBottom: 40 }}>
      <LandingNav />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 24px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 32, alignItems: "center" }}>
        {/* Left copy */}
        <div className="lumia-animate-fade-rise">
          <span className="lumia-eyebrow" style={{ background: "rgba(255,255,255,0.7)", color: "var(--green-deep)" }}>Wellness ritual · since 2026</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 5.4vw, 76px)", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.03em", color: "var(--foreground)", marginTop: 22 }}>
            Tĩnh lại,<br />và <span style={{ fontStyle: "italic", background: "var(--gradient-iris)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>nở</span> từ bên trong.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65, color: "var(--muted)", maxWidth: 460, marginTop: 22 }}>
            LUMIA gói trọn một nghi thức chữa lành — healing box, soundscape và một người bạn biết lắng nghe — trong không gian dịu lành của riêng bạn.
          </p>
          {/* frosted glass search (LOIK) */}
          <div className="lumia-glass" style={{ marginTop: 30, borderRadius: 999, display: "flex", alignItems: "center", gap: 10, padding: 7, maxWidth: 460 }}>
            <Icon name="search" size={18} color="var(--muted)" style={{ marginLeft: 14 }} />
            <input placeholder="Bạn đang cần điều gì tối nay?" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--foreground)" }} />
            <button style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "12px 22px", background: "var(--gradient-emerald)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>Khám phá</button>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 30 }}>
            {[["21", "ngày hành trình"], ["150+", "soundscape"], ["74%", "ngủ ngon hơn"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "var(--green-deep)" }}>{n}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Right blob */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="lumia-animate-fade-rise-delay">
          <GlassBlob size={420} />
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Hero });
