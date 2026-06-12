/* LUMIA mobile — app shell. A single, real-feeling app: tab navigation,
   native screen-slide transitions, and overlays (player, breathing, journal,
   mood). On phones it fills the viewport; on desktop it sits in one iOS frame. */
const { IOSDevice } = window;

function PhoneApp({ initial = "tonight" }) {
  const [screen, setScreen] = React.useState(initial);
  const [overlay, setOverlay] = React.useState(null); // player | breathing | journal
  const [mood, setMood] = React.useState(false);

  let content = null;
  if (screen === "tonight") content = <ScreenTonight onOpen={() => setOverlay("player")} onNav={setScreen} onMood={() => setMood(true)} onJournal={() => setOverlay("journal")} onBreathe={() => setOverlay("breathing")} />;
  else if (screen === "audio") content = <ScreenAudio onPlay={() => setOverlay("player")} onBreathe={() => setOverlay("breathing")} />;
  else if (screen === "listen") content = <ScreenListen />;
  else if (screen === "journey") content = <ScreenJourney />;
  else content = <ScreenYou onNav={setScreen} />;

  return (
    <div style={{ ["--background"]: "#ffffff", ["--surface-warm"]: "#f5f6f1", position: "relative", height: "100%", overflow: "hidden", background: "var(--background)" }}>
      <div key={screen} className="screen-enter" style={{ position: "absolute", inset: 0, overflowY: "auto" }}>{content}</div>

      {overlay === "player" ? <div className="sheet-enter" style={{ position: "absolute", inset: 0, zIndex: 110 }}><ScreenPlayer onBack={() => setOverlay(null)} /></div> : null}
      {overlay === "breathing" ? <Breathing onClose={() => setOverlay(null)} /> : null}
      {overlay === "journal" ? <JournalSheet onClose={() => setOverlay(null)} /> : null}
      {mood ? <MoodToast onDone={() => setMood(false)} /> : null}

      {overlay !== "player" && overlay !== "breathing" ? <TabBar active={screen} onNav={(s) => { setOverlay(null); setScreen(s); }} /> : null}
    </div>
  );
}

function ScreenYou({ onNav }) {
  return (
    <div style={{ minHeight: "100%", paddingTop: 52, background: "var(--background)" }}>
      <div style={{ padding: "0 18px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Linh Nguyễn</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 2 }}>LUMIA Sleep Well · còn 12 ngày</p>
      </div>
      {/* plan card */}
      <div className="lumia-grain" style={{ position: "relative", margin: "16px 16px 0", borderRadius: 24, overflow: "hidden", padding: "20px", background: "var(--gradient-honeyjade)" }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--lumia-text-mid)" }}>Gói đang dùng</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--matcha-text)", marginTop: 6 }}>LUMIA Sleep Well</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--lumia-text-mid)", marginTop: 2 }}>Còn 12 ngày · gia hạn 3 tháng</div>
        </div>
      </div>
      <div style={{ margin: "14px 16px 0", borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 14px 34px rgba(143,135,110,0.1)" }}>
        {[
          { i: "moon", t: "Nghi thức của tôi", s: "Lịch & nhắc nhở" },
          { i: "heart", t: "Bộ sưu tập", s: "12 soundscape đã lưu" },
          { i: "package", t: "Hộp LUMIA", s: "Quản lý gói & hộp vật lý" },
          { i: "shield", t: "Riêng tư", s: "Dữ liệu cảm xúc của bạn" },
          { i: "settings", t: "Cài đặt", s: "Thông báo · tài khoản" },
        ].map((r, idx, arr) => (
          <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", background: "var(--surface-card)", borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--matcha-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={r.i} size={18} color="var(--matcha-deep)" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{r.t}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{r.s}</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--muted)" />
          </div>
        ))}
      </div>
      <div style={{ height: 104 }} />
    </div>
  );
}

function App() {
  const [mobile, setMobile] = React.useState(window.innerWidth < 720);
  React.useEffect(() => {
    const on = () => setMobile(window.innerWidth < 720);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  if (mobile) {
    return <div style={{ position: "fixed", inset: 0 }}><PhoneApp /></div>;
  }

  return (
    <div className="lumia-grain" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "40px 24px", boxSizing: "border-box",
      background: "radial-gradient(60% 70% at 50% 0%, #f4f7f2 0%, #eef2ec 50%, #e7ece5 100%)" }}>
      <div style={{ position: "relative", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 500, color: "var(--green-deep)", letterSpacing: "-0.02em" }}>LUMIA — ứng dụng</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Chạm vào thanh điều hướng để khám phá đầy đủ tính năng</p>
      </div>
      <IOSDevice width={390} height={812}><PhoneApp /></IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
