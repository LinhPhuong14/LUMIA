/* LUMIA landing — Spark-style horizontal click-to-expand accordion.
   Five ritual stages; click a panel to expand it (others collapse to a
   labelled strip with vertical text). Each panel's background is an IMAGE
   PLACEHOLDER — set `img` on a stage to a photo URL to drop it in later. */

const LP_STAGES = [
  { id: 1, label: "Lắng", title: "Lắng lại", copy: "Bắt đầu bằng vài nhịp thở. Đặt điện thoại xuống, để cơ thể biết đã đến giờ nghỉ.", icon: "wind", img: null },
  { id: 2, label: "Nghe", title: "Nghe sương rơi", copy: "Một soundscape ấm chọn riêng cho tối nay — mưa hiên, rừng đêm, hay sóng xa.", icon: "music", img: null },
  { id: 3, label: "Viết", title: "Viết ra", copy: "Đặt cảm xúc xuống một chút. Không cần đúng sai, chỉ cần thật.", icon: "feather", img: null },
  { id: 4, label: "Thở", title: "Thở cùng vòng sáng", copy: "Bài thở 4-7-8 dẫn bạn vào tĩnh lặng, hơi thở chậm dần theo ánh sáng.", icon: "moon", img: null },
  { id: 5, label: "Ngủ", title: "Buông vào giấc", copy: "Khi cơ thể đã sẵn sàng, LUMIA mờ dần cùng bạn vào giấc ngủ sâu.", icon: "star", img: null },
];

function RitualAccordion() {
  const [active, setActive] = React.useState(2);
  return (
    <section id="nghi-thuc" data-screen-label="Nghi thức mỗi tối" style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px" }}>
      <div style={{ marginBottom: 30 }}>
        <span style={lpKicker}>— Nghi thức mỗi tối</span>
        <h2 style={lpH2}>Năm bước nhỏ, dẫn bạn vào giấc ngủ.</h2>
      </div>
      <div style={{ display: "flex", gap: 12, height: 380 }}>
        {LP_STAGES.map((s) => {
          const on = active === s.id;
          return (
            <div key={s.id} onClick={() => setActive(s.id)} style={{
              position: "relative", cursor: "pointer", borderRadius: 26, overflow: "hidden",
              width: on ? "52%" : "12%", flexShrink: 1, flexGrow: 0,
              background: "var(--surface-warm)",
              transition: "width 620ms cubic-bezier(0.22,1,0.36,1), box-shadow 500ms ease",
              boxShadow: on ? "0 24px 60px rgba(122,140,82,0.2)" : "0 10px 24px rgba(122,140,82,0.1)",
            }}>
              {/* image layer — drop a photo URL into `img` to replace the placeholder */}
              {s.img ? (
                <img src={s.img} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="lumia-grain-soft" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--surface-warm)" }}>
                  <div style={{ position: "absolute", inset: 12, borderRadius: 18, border: "1.5px dashed rgba(122,140,82,0.35)" }} />
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="image" size={22} color="var(--green-deep)" />
                  </div>
                  {on ? <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>Ảnh bước 0{s.id}</span> : null}
                </div>
              )}
              {/* bottom scrim so text stays legible over any photo */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(38,46,32,0.12) 0%, transparent 32%, transparent 48%, rgba(38,46,32,0.72) 100%)", pointerEvents: "none" }} />
              {/* number */}
              <div style={{ position: "absolute", top: 18, left: 20, zIndex: 3, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.06em" }}>0{s.id}</div>
              {/* collapsed: vertical label */}
              {!on ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 26 }}>
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.95)", letterSpacing: "0.02em", textShadow: "0 1px 8px rgba(38,46,32,0.4)" }}>{s.label}</span>
                </div>
              ) : null}
              {/* expanded content */}
              {on ? (
                <div key={"c" + s.id} className="lumia-animate-fade-rise" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 30, zIndex: 3 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "auto", border: "1px solid rgba(255,255,255,0.4)" }}>
                    <Icon name={s.icon} size={26} color="#fff" strokeWidth={1.6} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 2px 16px rgba(38,46,32,0.5)" }}>{s.title}</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.94)", maxWidth: 420, marginTop: 10, textShadow: "0 1px 10px rgba(38,46,32,0.45)" }}>{s.copy}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

Object.assign(window, { RitualAccordion });
