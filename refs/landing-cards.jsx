/* LUMIA landing — moana iridescent category cards + 2×2 stat tiles. */

const LP_CATS = [
  { t: "Ngủ sâu", s: "Soundscape & sleep cast", icon: "moon", grad: "var(--gradient-jade)" },
  { t: "Thiền", s: "Guided & mini meditation", icon: "sparkles", grad: "var(--gradient-emerald)" },
  { t: "Hơi thở", s: "4-7-8 & box breathing", icon: "wind", grad: "var(--gradient-iris)" },
  { t: "Nhật ký", s: "Viết ra, nhẹ lòng", icon: "feather", grad: "var(--gradient-honeyjade)" },
];

function Categories() {
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 40px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32 }}>
        <div>
          <span style={lpKicker}>— Không gian LUMIA</span>
          <h2 style={lpH2}>Bốn lối nhỏ để trở về với chính mình.</h2>
        </div>
        <a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--green-deep)", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>Tất cả <Icon name="arrow-right" size={16} color="var(--green-deep)" /></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        {LP_CATS.map((c) => (
          <article key={c.t} className="lumia-magnetic" style={{ borderRadius: 26, overflow: "hidden", cursor: "pointer", background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 14px 34px rgba(95,111,82,0.1)" }}>
            <div className="lumia-grain" style={{ position: "relative", height: 168, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", top: "16%", left: "18%", width: "44%", height: "30%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)", filter: "blur(4px)" }} />
              <Icon name={c.icon} size={42} color="rgba(255,255,255,0.95)" strokeWidth={1.4} />
            </div>
            <div style={{ padding: "18px 20px 22px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--foreground)" }}>{c.t}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{c.s}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const LP_STATS = [
  { n: "21", u: "ngày", l: "Hành trình ngủ sâu", grad: "var(--gradient-emerald)" },
  { n: "4M+", u: "phút", l: "Tĩnh lặng đã đi qua", grad: "var(--gradient-jade)" },
  { n: "150+", u: "bài", l: "Soundscape trong thư viện", grad: "var(--gradient-iris)" },
  { n: "74%", u: "", l: "Người dùng ngủ ngon hơn", grad: "var(--gradient-honeyjade)" },
];

function Stats() {
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 40, alignItems: "center" }}>
        <div>
          <span style={lpKicker}>— Sức mạnh của một nghi thức nhỏ</span>
          <h2 style={lpH2}>Mỗi tối một chút, đủ để đổi cả giấc ngủ.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.65, color: "var(--muted)", marginTop: 16, maxWidth: 420 }}>
            Không phải cố gắng nhiều hơn — chỉ là quay lại đều đặn. LUMIA giữ nhịp giúp bạn, dịu dàng và không phán xét.
          </p>
          <button style={{ marginTop: 24, border: "none", cursor: "pointer", borderRadius: 999, padding: "13px 26px", background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(63,158,110,0.3)" }}>Bắt đầu hành trình</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {LP_STATS.map((s) => (
            <div key={s.l} className="lumia-iris lumia-grain lumia-magnetic" style={{ borderRadius: 26, padding: "26px 24px", minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: s.grad }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 600, color: "#fff", lineHeight: 1, textShadow: "0 2px 12px rgba(44,122,82,0.3)" }}>
                {s.n}<span style={{ fontSize: 18, fontWeight: 500, marginLeft: 4 }}>{s.u}</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)", marginTop: 10 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const lpKicker = { fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)" };
const lpH2 = { fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.4vw, 40px)", fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: 12, maxWidth: 520 };

Object.assign(window, { Categories, Stats, lpKicker, lpH2 });
