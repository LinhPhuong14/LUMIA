/* LUMIA landing — webapp showcase. Embeds the REAL dashboard inner pages
   (ui_kits/dashboard) live via iframe inside a browser frame, so the landing
   and the dashboard kit stay in sync. Pills switch the embedded page via
   postMessage (no reload). */

const WA_PAGES = [
  { id: "hub", label: "Trang chủ", icon: "home" },
  { id: "listen", label: "Lắng nghe", icon: "message-circle" },
  { id: "journal", label: "Nhật ký", icon: "pen-line" },
  { id: "audio", label: "Âm thanh", icon: "music" },
  { id: "streak", label: "Streak", icon: "flame" },
];

function WebappDemo() {
  const [page, setPage] = React.useState("hub");
  const frameRef = React.useRef(null);
  const FW = 1380, FH = 920, VW = 1100;
  const scale = VW / FW;
  const go = (id) => {
    setPage(id);
    if (frameRef.current && frameRef.current.contentWindow) {
      frameRef.current.contentWindow.postMessage({ lumiaPage: id }, "*");
    }
  };
  return (
    <section id="web-app" data-screen-label="LUMIA trên web" className="lumia-aura-soft lumia-grain" style={{ position: "relative", overflow: "hidden", marginTop: 24 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 40px 72px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 26 }}>
          <div>
            <span style={lpKicker}>— LUMIA trên web</span>
            <h2 style={lpH2}>Một dashboard dịu dàng cho hành trình 21 ngày.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.65, color: "var(--muted)", marginTop: 14, maxWidth: 520 }}>
              Mỗi trang bên dưới là giao diện thật của LUMIA web app — check-in, lắng nghe, nhật ký, âm thanh và streak, tất cả trong một không gian.
            </p>
          </div>
          <a href="../dashboard/index.html" style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--green-deep)", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>Mở dashboard <Icon name="arrow-right" size={16} color="var(--green-deep)" /></a>
        </div>
        {/* page pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {WA_PAGES.map((p) => {
            const on = page === p.id;
            return (
              <button key={p.id} onClick={() => go(p.id)} style={{
                border: on ? "1px solid transparent" : "1px solid var(--border)", cursor: "pointer", borderRadius: 999, padding: "10px 18px",
                display: "inline-flex", alignItems: "center", gap: 8,
                background: on ? "var(--green)" : "rgba(255,255,255,0.7)", color: on ? "#fff" : "var(--green-deep)",
                fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600,
                boxShadow: on ? "0 12px 26px rgba(63,158,110,0.3)" : "none",
                transition: "background 220ms ease, color 220ms ease, box-shadow 220ms ease" }}>
                <Icon name={p.icon} size={15} color={on ? "#fff" : "var(--green-deep)"} /> {p.label}
              </button>
            );
          })}
        </div>
        {/* browser frame */}
        <div style={{ borderRadius: 26, overflow: "hidden", border: "1px solid var(--border)", background: "#ffffff", boxShadow: "0 30px 70px rgba(95,111,82,0.16)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: 46, padding: "0 18px", background: "rgba(253,250,242,0.9)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#DFA6A0" }}></span>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#EBC872" }}></span>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#9CAF88" }}></span>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, background: "var(--surface-warm)", padding: "6px 18px", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)" }}>
                <Icon name="lock" size={11} color="var(--muted)" /> app.lumia.vn/dashboard
              </div>
            </div>
            <div style={{ width: 47 }}></div>
          </div>
          <div style={{ position: "relative", height: FH * scale, overflow: "hidden" }}>
            <iframe
              ref={frameRef}
              src="../dashboard/index.html?p=hub"
              title="LUMIA dashboard"
              scrolling="no"
              style={{ position: "absolute", top: 0, left: 0, width: FW, height: FH, border: "none", transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { WebappDemo });
