/* LUMIA mobile — feature screens & sheets: Audio library, 4-7-8 Breathing,
   AI "Lắng nghe" chat, Journal compose sheet, Mood toast. */

const TRACKS = {
  sleep: [
    { t: "Mưa đêm trên mái hiên", d: "45:00", c: "Sleep Sound" },
    { t: "Thung lũng sương", d: "18:00", c: "Soundscape" },
    { t: "Chuyện kể ru ngủ — Khu rừng", d: "32:00", c: "Sleep Cast" },
    { t: "Sóng biển thì thầm", d: "60:00", c: "Sleep Sound" },
  ],
  meditation: [
    { t: "Thiền buổi tối", d: "10:00", c: "Guided" },
    { t: "Thả lỏng lo âu", d: "12:00", c: "Guided" },
    { t: "Mini — Biết ơn", d: "03:00", c: "Mini" },
    { t: "Body scan trước ngủ", d: "15:00", c: "Guided" },
  ],
};

/* ── Screen: Audio library ── */
function ScreenAudio({ onPlay, onBreathe }) {
  const [tab, setTab] = React.useState("sleep");
  return (
    <div style={window.screenWrap}>
      <window.TopBar title="Âm thanh" onBack={() => {}} trailingIcon="search" />
      <div style={{ padding: "0 18px 6px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 25, fontWeight: 400, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Chọn âm thanh cho tối nay.</h1>
      </div>
      {/* segmented */}
      <div style={{ margin: "12px 16px 0", display: "flex", padding: 4, borderRadius: 14, background: "rgba(149,170,99,0.14)" }}>
        {[["sleep", "Giấc ngủ"], ["meditation", "Thiền"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 11, padding: "9px 0", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
            background: tab === id ? "#fff" : "transparent", color: tab === id ? "var(--matcha-deep)" : "var(--muted)", boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{l}</button>
        ))}
      </div>
      {/* breathing CTA */}
      <button onClick={onBreathe} style={{ margin: "14px 16px 0", width: "calc(100% - 32px)", textAlign: "left", border: "none", cursor: "pointer", borderRadius: 22, padding: "16px 18px", background: "var(--gradient-fresh)", display: "flex", alignItems: "center", gap: 14 }}>
        <div className="lumia-animate-breathe-glow" style={{ width: 48, height: 48, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #fff, var(--matcha))", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="wind" size={22} color="var(--matcha-deep)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--matcha-text)" }}>Bài thở 4-7-8</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--lumia-text-mid)", marginTop: 1 }}>Thở cùng vòng sáng</div>
        </div>
        <Icon name="arrow-right" size={18} color="var(--matcha-deep)" />
      </button>
      {/* track list */}
      <div style={{ margin: "14px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {TRACKS[tab].map((tk) => (
          <button key={tk.t} onClick={() => onPlay(tk)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, padding: "11px 13px", borderRadius: 18, border: "1px solid var(--border)", background: "var(--surface-card)", cursor: "pointer" }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--gradient-jade)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="play" size={17} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{tk.t}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{tk.c} · {tk.d}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ height: 104 }} />
    </div>
  );
}

/* ── Overlay: 4-7-8 breathing ── */
function Breathing({ onClose }) {
  const phases = [{ k: "Hít vào", s: 4, scale: 1.35 }, { k: "Giữ", s: 7, scale: 1.35 }, { k: "Thở ra", s: 8, scale: 0.85 }];
  const [pi, setPi] = React.useState(0);
  const [sec, setSec] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setSec((s) => { if (s + 1 >= phases[pi].s) { setPi((p) => (p + 1) % 3); return 0; } return s + 1; }), 1000);
    return () => clearInterval(id);
  }, [pi]);
  const ph = phases[pi];
  return (
    <div className="sheet-enter" style={{ position: "absolute", inset: 0, zIndex: 120, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}><MistyScene variant="dusk" /></div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(238,239,229,0.7)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 56, right: 22, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={19} color="var(--matcha-deep)" /></button>
        <div style={{ width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle at 32% 30%, #fff, var(--matcha) 78%)", boxShadow: "0 0 60px rgba(143,168,120,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ph.scale})`, transition: `transform ${ph.s}s ease-in-out` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--foreground)" }}>{ph.k}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{ph.s - sec}s</div>
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 44 }}>4-7-8 · hít 4 · giữ 7 · thở 8</p>
      </div>
    </div>
  );
}

/* ── Screen: AI "Lắng nghe" chat ── */
const STARTERS = ["Tối nay mình thấy hơi quá tải", "Mình khó ngủ mấy hôm nay", "Mình mệt vì công việc"];
const REPLY = "Mình ở đây với bạn. Nghe có vẻ hôm nay nhiều thứ dồn lại cùng lúc. Bạn không cần giải thích hay sắp xếp gì cả — mình có thể cùng bạn thở chậm vài nhịp trước, nếu bạn muốn.";

function ScreenListen() {
  const [msgs, setMsgs] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, typing]);
  function send(text) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { r: "u", c: text }]); setInput(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { r: "a", c: REPLY }]); }, 1100);
  }
  return (
    <div style={{ ...window.screenWrap, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <window.TopBar title="Lắng nghe" onBack={() => {}} trailingIcon="info" />
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "8px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", padding: "0 20px" }}>
            <div className="lumia-animate-breathe-glow" style={{ width: 70, height: 70, borderRadius: "50%", margin: "0 auto", background: "radial-gradient(circle at 30% 30%, var(--matcha-soft), var(--matcha))", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="moon-star" size={30} color="var(--matcha-deep)" /></div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--matcha-deep)", marginTop: 16 }}>LUMIA đang lắng nghe</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Hôm nay bạn muốn chia sẻ điều gì?</p>
          </div>
        ) : null}
        {msgs.map((m, i) => (
          <div key={i} style={{ maxWidth: "82%", alignSelf: m.r === "u" ? "flex-end" : "flex-start", borderRadius: 18, padding: "11px 15px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55,
            background: m.r === "u" ? "var(--matcha-soft)" : "var(--surface-card)", color: m.r === "u" ? "var(--matcha-text)" : "var(--foreground)", border: m.r === "a" ? "1px solid var(--border)" : "none" }}>{m.c}</div>
        ))}
        {typing ? <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", paddingLeft: 4 }}>LUMIA đang lắng nghe…</div> : null}
      </div>
      {msgs.length === 0 ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 16px 10px" }}>
          {STARTERS.map((s) => <button key={s} onClick={() => send(s)} style={{ borderRadius: 999, border: "1px solid var(--matcha-soft)", background: "var(--surface-card)", padding: "8px 13px", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--matcha-deep)", cursor: "pointer" }}>{s}</button>)}
        </div>
      ) : null}
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 9, padding: "0 16px", marginBottom: 96 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Viết điều đang ở trong lòng…" style={{ flex: 1, borderRadius: 999, border: "1px solid var(--matcha-soft)", background: "var(--surface-card)", padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--foreground)", outline: "none" }} />
        <button type="submit" style={{ flexShrink: 0, width: 46, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--matcha-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="arrow-up" size={18} color="#fff" /></button>
      </form>
    </div>
  );
}

/* ── Sheet: Journal compose ── */
function JournalSheet({ onClose }) {
  const prompts = ["Biết ơn", "Buông bỏ", "Một niềm vui nhỏ"];
  const [tag, setTag] = React.useState(0);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 130, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(56,51,40,0.3)", backdropFilter: "blur(3px)" }} />
      <div className="sheet-enter" style={{ position: "relative", borderRadius: "30px 30px 0 0", background: "var(--surface)", padding: "20px 18px 28px", boxShadow: "0 -20px 50px rgba(56,51,40,0.2)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--matcha-soft)", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--foreground)" }}>Viết ra</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}><Icon name="x" size={20} color="var(--muted)" /></button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {prompts.map((p, i) => (
            <button key={p} onClick={() => setTag(i)} style={{ borderRadius: 999, padding: "7px 14px", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              border: tag === i ? "1px solid var(--matcha-deep)" : "1px solid var(--matcha-soft)", background: tag === i ? "var(--matcha-soft)" : "var(--surface-card)", color: "var(--matcha-deep)" }}>{p}</button>
          ))}
        </div>
        <textarea placeholder="Đặt cảm xúc xuống một chút. Không cần đúng sai, chỉ cần thật…" style={{ width: "100%", marginTop: 14, minHeight: 130, resize: "none", borderRadius: 18, border: "1px solid var(--matcha-soft)", background: "var(--surface-card)", padding: 16, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }} />
        <button onClick={onClose} style={{ marginTop: 14, width: "100%", border: "none", cursor: "pointer", borderRadius: 999, padding: "14px 0", background: "var(--gradient-primary)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>Lưu vào nhật ký</button>
      </div>
    </div>
  );
}

/* ── Toast: mood saved ── */
function MoodToast({ onDone }) {
  React.useEffect(() => { const id = setTimeout(onDone, 1800); return () => clearTimeout(id); }, []);
  return (
    <div className="sheet-enter" style={{ position: "absolute", left: 16, right: 16, bottom: 96, zIndex: 140, borderRadius: 18, padding: "13px 18px", display: "flex", alignItems: "center", gap: 10,
      background: "var(--matcha-deep)", boxShadow: "0 14px 30px rgba(95,111,82,0.3)" }}>
      <Icon name="check" size={17} color="#fff" />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#fff" }}>Đã ghi lại cảm xúc của bạn tối nay.</span>
    </div>
  );
}

Object.assign(window, { ScreenAudio, Breathing, ScreenListen, JournalSheet, MoodToast });
