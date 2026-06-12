/* LUMIA landing — mobile demo + join band (newsletter) + site footer.
   Phone mockups embed the REAL LUMIA mobile screens (live, via iframe) so the
   illustration always matches the actual mobile design. Join band + footer
   columns adapted from the upstream repo's join-section / footer-section. */

function PhoneMock({ screen = "tonight", panel, style = {} }) {
  const W = 250, H = 520, SCALE = 0.62;
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ width: W, height: H, borderRadius: 40, background: "#1f2a22", padding: 8, boxShadow: "0 24px 50px rgba(31,42,34,0.35)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 33, overflow: "hidden", background: "#fff" }}>
          {/* notch */}
          <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 80, height: 20, background: "#1f2a22", borderRadius: 16, zIndex: 5 }} />
          <iframe
            src={`../mobile-app/screen-embed.html?s=${screen}`}
            title={`LUMIA mobile · ${screen}`}
            scrolling="no"
            style={{ position: "absolute", top: 0, left: 0, width: 390, height: H / SCALE, border: "none", transform: `scale(${SCALE})`, transformOrigin: "top left", pointerEvents: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

function MobileDemo() {
  return (
    <section data-screen-label="LUMIA trong túi bạn" style={{ position: "relative", overflow: "hidden", marginTop: 24 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
        <div>
          <span style={lpKicker}>— LUMIA trong túi bạn</span>
          <h2 style={lpH2}>Mang nghi thức dịu lành theo mỗi tối.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.65, color: "var(--muted)", marginTop: 16, maxWidth: 420 }}>
            Mở app, chạm một lần, và để LUMIA dẫn bạn qua hơi thở, âm thanh và giấc ngủ. Mọi thứ đồng bộ với healing box của bạn.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
          <PhoneMock screen="tonight" style={{ transform: "translateY(18px) rotate(-4deg)" }} />
          <PhoneMock screen="journey" style={{ transform: "translateY(-12px) rotate(3deg)" }} />
        </div>
      </div>
    </section>
  );
}

/* Newsletter band — "Tham gia ritual của LUMIA" (from repo join-section). */
function JoinBand() {
  return (
    <section data-screen-label="Tham gia ritual" style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 40px 64px" }}>
      <div className="lumia-grain" style={{ position: "relative", borderRadius: 36, overflow: "hidden", padding: "76px 48px", textAlign: "center", background: "var(--gradient-emerald)" }}>
        {/* iridescent glows */}
        <div aria-hidden="true" style={{ position: "absolute", top: "-36%", left: "12%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,235,158,0.5), transparent 68%)", filter: "blur(24px)" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-40%", right: "10%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 68%)", filter: "blur(24px)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 4.2vw, 54px)", fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.03em", color: "#fff", textShadow: "0 2px 18px rgba(31,86,58,0.35)" }}>
            Tham gia ritual của LUMIA
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginTop: 16, maxWidth: 480, marginInline: "auto" }}>
            Nhận ưu đãi sớm, cập nhật về các hộp mới và những gợi ý dịu dàng dành riêng cho buổi tối của bạn.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              style={{ flex: 1, maxWidth: 340, minWidth: 0, borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.16)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "0 24px", height: 54, outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "#fff" }}
            />
            <button style={{ border: "none", cursor: "pointer", borderRadius: 999, height: 54, padding: "0 28px", background: "#fff", color: "var(--green-deep)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 14px 30px rgba(31,86,58,0.3)" }}>
              Đăng ký nhận tin <Icon name="arrow-right" size={15} color="var(--green-deep)" />
            </button>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 18 }}>
            Bạn có thể dừng nhận tin bất cứ lúc nào. LUMIA tôn trọng sự riêng tư của bạn.
          </p>
        </div>
      </div>
    </section>
  );
}

/* 4-column footer (link structure from repo footer-section). */
const LP_FOOT_COLS = [
  { h: "Hộp LUMIA", links: ["Tất cả sản phẩm", "Hộp Khởi đầu", "Hộp Mỗi ngày", "Hộp Dịu sâu", "Hộp Quà tặng"] },
  { h: "Về LUMIA", links: ["Cách đồng hành", "Cảm nhận", "Tạo tài khoản", "Đăng nhập"] },
  { h: "Hỗ trợ", links: ["Mua hộp LUMIA", "Tài khoản", "Cài đặt riêng tư", "Thanh toán"] },
];

function SiteFooter() {
  return (
    <footer data-screen-label="Footer" style={{ borderTop: "1px solid var(--border)", background: "var(--surface-warm)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr 0.8fr 0.8fr", gap: 40 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "var(--green-deep)" }}>lumia</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.8, color: "var(--muted)", marginTop: 12, maxWidth: 300 }}>
              Một beauty wellness ritual dành cho những buổi tối cần chậm lại, mềm hơn và dịu hơn với chính mình.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {["instagram", "facebook"].map((n) => (
                <button key={n} aria-label={n} style={{ cursor: "pointer", width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 26px rgba(95,111,82,0.08)" }}>
                  <Icon name={n} size={16} color="var(--muted)" />
                </button>
              ))}
            </div>
          </div>
          {LP_FOOT_COLS.map((c) => (
            <div key={c.h}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 700, color: "var(--foreground)" }}>{c.h}</div>
              <div style={{ display: "grid", gap: 11, marginTop: 16 }}>
                {c.links.map((l) => (
                  <a key={l} href="#" style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--muted)" }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)" }}>LUMIA không thay thế chuyên gia y tế hay tâm lý.</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)" }}>© 2026 LUMIA · EST. 2026</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { MobileDemo, JoinBand, SiteFooter });
