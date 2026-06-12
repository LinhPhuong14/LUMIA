/* LUMIA dashboard — pages: Today Ritual Hub, Lắng nghe (AI), Nhật ký / Mood Dump. */

/* ── 08 · Today Ritual Hub ── */
const HUB_MOODS = [
  { e: "🙂", l: "Bình yên" }, { e: "😮‍💨", l: "Mệt" }, { e: "😟", l: "Lo" },
  { e: "🙁", l: "Buồn" }, { e: "😣", l: "Căng" }, { e: "😶", l: "Trống rỗng" },
];

function PageHub() {
  const [mood, setMood] = React.useState(0);
  const [level, setLevel] = React.useState(3);
  return (
    <div style={dashPageWrap}>
      <TopBar title="Chào buổi tối, Linh 👋" sub="Hôm nay bạn muốn bắt đầu từ đâu?" />
      {/* Misty ritual hero banner */}
      <div className="lumia-grain" style={{ position: "relative", height: 168, borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 34px rgba(122,140,82,0.14)" }}>
        <MistyScene variant="dawn" />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" }}>
          <div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--matcha-text)", background: "rgba(255,255,255,0.6)", padding: "5px 12px", borderRadius: 999, backdropFilter: "blur(6px)" }}>Nghi thức tối nay</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 500, color: "#42361f", marginTop: 12, letterSpacing: "-0.02em" }}>Thung lũng sương · 18 phút</h2>
          </div>
          <button style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "13px 26px", display: "flex", alignItems: "center", gap: 8, background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(122,140,82,0.3)" }}><Icon name="play" size={16} color="#fff" /> Bắt đầu</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>
        {/* Mood check-in */}
        <Panel title="Bạn đang cảm thấy thế nào?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {HUB_MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 4px", borderRadius: 16, cursor: "pointer",
                border: mood === i ? "1.5px solid var(--green)" : "1px solid var(--border)", background: mood === i ? "var(--green-wash)" : "var(--surface)" }}>
                <span style={{ fontSize: 22 }}>{m.e}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, color: "var(--muted)" }}>{m.l}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
              <span>Mức độ (1–5)</span><span style={{ fontWeight: 700, color: "var(--green-deep)" }}>{level}</span>
            </div>
            <input type="range" min="1" max="5" value={level} onChange={(e) => setLevel(+e.target.value)} style={{ width: "100%", accentColor: "var(--green)" }} />
          </div>
          <button style={{ ...hubPrimaryBtn, marginTop: "auto" }}>Check-in nhẹ nhàng</button>
        </Panel>
        {/* Suggestion */}
        <Panel title="Gợi ý cho hôm nay">
          <div className="lumia-grain" style={{ position: "relative", flex: 1, borderRadius: 18, overflow: "hidden", padding: "18px 18px", background: "var(--gradient-honeyjade)", marginBottom: 16, display: "flex", alignItems: "flex-start" }}>
            <p style={{ position: "relative", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--lumia-text)", maxWidth: 340 }}>
              Bạn vẻ cần một routine nhẹ. Thử mở 2 phút, viết đôi dòng journal và Thiền ngủ 5 phút.
            </p>
          </div>
          <button style={hubPrimaryBtn}>Bắt đầu routine</button>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button style={hubGhostBtn}><Icon name="music" size={15} color="var(--green-deep)" /> Nghe thiền</button>
            <button style={hubGhostBtn}><Icon name="feather" size={15} color="var(--green-deep)" /> Viết journal</button>
          </div>
        </Panel>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {[
          { i: "flame", t: "Streak", v: "Soft Week", s: "7 ngày liên tiếp", c: "var(--honey-dark)" },
          { i: "moon", t: "Sleep", v: "Wind-down", s: "Thường ngủ lúc 22:15", c: "var(--green-deep)" },
          { i: "trending-up", t: "Mood trend", v: "Ổn định hơn", s: "+12% so với tuần trước", c: "var(--rose-deep)" },
        ].map((st) => (
          <Panel key={st.t} pad={20}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--green-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={st.i} size={18} color={st.c} /></div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{st.t}</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--foreground)", marginTop: 14 }}>{st.v}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{st.s}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
const hubPrimaryBtn = { marginTop: 18, width: "100%", border: "none", cursor: "pointer", borderRadius: 999, padding: "13px 0", background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(122,140,82,0.28)" };
const hubGhostBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", borderRadius: 999, padding: "11px 0", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--green-deep)" };

/* ── 09 · Lắng nghe (AI chatbot) ── */
const CHAT_THREADS = [{ t: "Hôm nay mình thấy mệt", d: "20:16", on: true }, { t: "Cảm thấy lo lắng", d: "Hôm qua" }, { t: "Một ngày ổn áp", d: "01/06" }, { t: "Khó ngủ", d: "30/05" }];
const CHAT_SUGGEST = ["Viết nhật ký 3 phút", "Thiền ngủ 5 phút", "Bài thở 4-7-8", "Chuẩn bị đi ngủ"];

function PageListen() {
  const [msgs, setMsgs] = React.useState([
    { r: "u", c: "Hôm nay mình thấy rất mệt mà vô áp lực..." },
    { r: "a", c: "Cảm ơn bạn đã chia sẻ với LUMIA. Nghe có vẻ bạn đang mang nhiều điều trong lòng. Bạn có muốn kể thêm về điều gì khiến bạn mệt nhất không?" },
  ]);
  const [input, setInput] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);
  function send(t) {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { r: "u", c: t }]); setInput("");
    setTimeout(() => setMsgs((m) => [...m, { r: "a", c: "Mình ở đây với bạn. Mình không cố sửa gì cả — chỉ cùng bạn chậm lại một chút." }]), 900);
  }
  return (
    <div style={dashPageWrap}>
      <TopBar title="Lắng nghe" sub="LUMIA là người bạn đồng hành, không thay thế chuyên gia y tế hay tâm lý." />
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr 230px", gap: 16, flex: 1, minHeight: 0 }}>
        {/* threads */}
        <Panel pad={14} style={{ display: "flex", flexDirection: "column" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", borderRadius: 14, padding: "11px 12px", background: "var(--green-wash)", color: "var(--green-deep)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Icon name="plus" size={16} color="var(--green-deep)" /> Cuộc trò chuyện mới
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
            {CHAT_THREADS.map((th, i) => (
              <button key={i} style={{ textAlign: "left", border: "none", cursor: "pointer", borderRadius: 12, padding: "10px 12px", background: th.on ? "var(--surface-warm)" : "transparent" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{th.t}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{th.d}</div>
              </button>
            ))}
          </div>
        </Panel>
        {/* chat */}
        <Panel pad={0} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div className="lumia-animate-breathe-glow" style={{ width: 34, height: 34, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, var(--green-mint), var(--green))", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="moon-star" size={16} color="#fff" /></div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>LUMIA đang lắng nghe bạn</span>
          </div>
          <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ maxWidth: "78%", alignSelf: m.r === "u" ? "flex-end" : "flex-start", borderRadius: 18, padding: "11px 15px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55,
                background: m.r === "u" ? "var(--matcha-soft)" : "var(--surface-warm)", color: m.r === "u" ? "var(--matcha-text)" : "var(--foreground)" }}>{m.c}</div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 9, padding: 16, borderTop: "1px solid var(--border)" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Viết ra điều gì đang trong lòng bạn..." style={{ flex: 1, borderRadius: 999, border: "1px solid var(--matcha-soft)", background: "var(--surface)", padding: "11px 16px", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--foreground)", outline: "none" }} />
            <button type="submit" style={{ width: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="arrow-up" size={18} color="#fff" /></button>
          </form>
        </Panel>
        {/* suggestions */}
        <Panel title="Gợi ý từ LUMIA" pad={16}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CHAT_SUGGEST.map((s) => (
              <button key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", borderRadius: 14, padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--foreground)" }}>
                {s} <Icon name="chevron-right" size={15} color="var(--muted)" />
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── 10 · Nhật ký / Mood Dump ── */
const JOURNAL_TABS = [["quick", "Xả nhanh"], ["guided", "Journal có hướng dẫn"], ["mood", "Mood test"]];
const JOURNAL_PROMPTS = ["Hôm nay có gì khiến bạn mệt?", "Điều gì làm bạn thấy biết ơn?", "Nếu cảm xúc này có màu sắc, nó là màu gì?", "Bạn cần điều gì ngay lúc này?"];

function PageJournal() {
  const [tab, setTab] = React.useState("quick");
  return (
    <div style={dashPageWrap}>
      <TopBar title="Nhật ký" sub="Một nơi an toàn để đặt cảm xúc xuống." />
      <div style={{ display: "flex", gap: 8 }}>
        {JOURNAL_TABS.map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ border: "1px solid var(--border)", cursor: "pointer", borderRadius: 999, padding: "9px 18px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
            background: tab === id ? "var(--green)" : "var(--surface-card)", color: tab === id ? "#fff" : "var(--muted)", borderColor: tab === id ? "transparent" : "var(--border)" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>
        <Panel pad={26}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Cứ viết ra.<br />Không cần đúng, không cần hay.</h2>
          <textarea placeholder="Viết mọi thứ bạn muốn xả ở đây…" style={{ width: "100%", marginTop: 20, minHeight: 230, resize: "none", border: "1px solid var(--matcha-soft)", borderRadius: 18, background: "var(--surface)", padding: 18, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.7, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Bạn có thể xóa bất cứ lúc nào.</span>
            <button style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "12px 28px", background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(122,140,82,0.28)" }}>Xả đi</button>
          </div>
        </Panel>
        <Panel title="Gợi ý cho bạn" pad={18}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {JOURNAL_PROMPTS.map((p) => (
              <button key={p} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", borderRadius: 14, padding: "13px 15px", fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.4, color: "var(--foreground)" }}>
                {p} <Icon name="chevron-right" size={15} color="var(--muted)" />
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { PageHub, PageListen, PageJournal });
