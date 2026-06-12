/* LUMIA landing — "LUMIA lắng nghe" AI chat section.
   Adapted from the upstream repo's ai-listening-section.tsx (copy verbatim). */

function AiListening() {
  return (
    <section id="lang-nghe" data-screen-label="LUMIA lắng nghe" style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 24, alignItems: "stretch" }}>
        {/* chat demo panel */}
        <div className="lumia-glass lumia-grain-soft" style={{ borderRadius: 30, padding: "34px 36px" }}>
          <span style={lpKicker}>— LUMIA lắng nghe</span>
          <h2 style={{ ...lpH2, maxWidth: 460 }}>Lắng nghe, không phán xét.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", borderRadius: 22, background: "rgba(255,255,255,0.8)", padding: "14px 18px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--foreground)", boxShadow: "0 10px 26px rgba(122,140,82,0.08)" }}>
              Hôm nay bạn muốn LUMIA lắng nghe điều gì?
            </div>
            <div style={{ alignSelf: "flex-end", maxWidth: "84%", borderRadius: 22, background: "var(--green-wash)", padding: "14px 18px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--green-deep)" }}>
              Mình thấy hơi quá tải nhưng không biết nên bắt đầu từ đâu.
            </div>
            <div style={{ alignSelf: "flex-start", maxWidth: "92%", borderRadius: 22, background: "rgba(255,255,255,0.9)", padding: "14px 18px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--foreground)", boxShadow: "0 18px 40px rgba(143,168,120,0.12)" }}>
              Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ trong lòng. Bạn muốn kể thêm một chút về điều nặng nhất không?
            </div>
          </div>
        </div>
        {/* side cards */}
        <div style={{ display: "grid", gap: 16, gridTemplateRows: "auto 1fr auto" }}>
          <article style={{ borderRadius: 24, background: "var(--surface-card)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "0 12px 30px rgba(95,111,82,0.08)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.65, color: "var(--muted)" }}>
              LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
            </p>
          </article>
          <article className="lumia-grain" style={{ borderRadius: 24, padding: "26px 26px", background: "var(--gradient-honeyjade)", display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "0 16px 38px rgba(95,111,82,0.14)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(44,122,82,0.3)" }}>Cứ viết ra.</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.94)", marginTop: 8, maxWidth: 360 }}>
              Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy mình nhẹ đi một chút.
            </p>
          </article>
          <article style={{ borderRadius: 24, background: "var(--surface-card)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "0 12px 30px rgba(95,111,82,0.08)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 14, background: "linear-gradient(145deg, #FFFDF5, #DDE8D2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="notebook-pen" size={18} color="var(--green-deep)" />
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--foreground)" }}>
              Bạn đã đặt cảm xúc này xuống một chút rồi.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AiListening });
