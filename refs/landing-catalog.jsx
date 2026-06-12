/* LUMIA landing — subscription box catalog (the physical healing boxes). */

const LP_BOXES = [
  { name: "First-Time", price: "99.000đ", per: "1 tháng", blurb: "Premium đầy đủ + Mini Welcome Box: trà thảo mộc & xịt gối.", grad: "var(--gradient-jade)", icon: "gift" },
  { name: "Standard", price: "129.000đ", per: "1 tháng", blurb: "Premium không giới hạn, ưu đãi 10% cho sản phẩm vật lý.", grad: "var(--gradient-lime)", icon: "package" },
  { name: "Saver", price: "349.000đ", per: "3 tháng", blurb: "Chỉ ~116.000đ/tháng — gói tiết kiệm nhẹ nhàng.", grad: "var(--gradient-emerald)", icon: "leaf", featured: true },
  { name: "Sleep Well", price: "699.000đ", per: "3 tháng", blurb: "Kèm Sleep Well Box: nến, trà thảo mộc, bịt mắt lụa.", grad: "var(--gradient-honeyjade)", icon: "moon" },
  { name: "Sleep Master", price: "1.199.000đ", per: "6 tháng", blurb: "Gói cao cấp 6 tháng kèm Master Box đầy đủ nhất.", grad: "var(--gradient-iris)", icon: "crown" },
];

function BoxCatalog() {
  return (
    <section id="hop-lumia" data-screen-label="Hộp LUMIA" style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32 }}>
        <div>
          <span style={lpKicker}>— Hộp LUMIA</span>
          <h2 style={lpH2}>Chọn chiếc hộp hợp với nhịp chăm sóc của bạn.</h2>
        </div>
        <a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--green-deep)", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>So sánh gói <Icon name="arrow-right" size={16} color="var(--green-deep)" /></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {LP_BOXES.map((b) => (
          <article key={b.name} className="lumia-magnetic" style={{ position: "relative", display: "flex", flexDirection: "column", borderRadius: 24, overflow: "hidden", cursor: "pointer",
            background: "var(--surface-card)", border: b.featured ? "1.5px solid var(--green)" : "1px solid var(--border)",
            boxShadow: b.featured ? "0 22px 48px rgba(122,140,82,0.18)" : "0 12px 30px rgba(95,111,82,0.09)" }}>
            {b.featured ? (
              <span style={{ position: "absolute", top: 12, right: 12, zIndex: 3, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "var(--green)", padding: "5px 10px", borderRadius: 999 }}>Phổ biến</span>
            ) : null}
            {/* box "image" */}
            <div className="lumia-grain" style={{ position: "relative", height: 116, background: b.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", top: "14%", left: "16%", width: "46%", height: "32%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.65), transparent 70%)", filter: "blur(4px)" }} />
              <Icon name={b.icon} size={32} color="rgba(255,255,255,0.95)" strokeWidth={1.5} />
            </div>
            <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: "var(--foreground)" }}>{b.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--green-deep)" }}>{b.price}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>/ {b.per}</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.5, color: "var(--muted)", marginTop: 8, flex: 1 }}>{b.blurb}</p>
              <button style={{ marginTop: 14, width: "100%", border: "none", cursor: "pointer", borderRadius: 999, padding: "10px 0", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                background: b.featured ? "var(--green)" : "var(--green-wash)", color: b.featured ? "#fff" : "var(--green-deep)",
                boxShadow: b.featured ? "0 10px 22px rgba(122,140,82,0.3)" : "none" }}>Chọn gói</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { BoxCatalog });
