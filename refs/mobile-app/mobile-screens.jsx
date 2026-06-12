/* LUMIA mobile — app screens. Designed to fill a phone viewport, native-app
   feel: misty hero scenes, glass panels, circular stat badges, pill buttons,
   a frosted bottom tab bar. Composes brand tokens + the MistyScene. */

/* ── Shared chrome ── */
function TopBar({ title, onBack, trailingIcon = "more-horizontal" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 18px 10px", position: "relative", zIndex: 5 }}>
      <button onClick={onBack} style={glassBtn}><Icon name="arrow-left" size={19} color="var(--foreground)" /></button>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{title}</span>
      <button style={glassBtn}><Icon name={trailingIcon} size={19} color="var(--foreground)" /></button>
    </div>
  );
}
const glassBtn = {
  width: 40, height: 40, borderRadius: 14, border: "1px solid rgba(255,255,255,0.7)",
  background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  boxShadow: "0 2px 8px rgba(95,111,82,0.08)",
};

/* Circular stat badge — the soft neumorphic discs from the reference. */
function StatDisc({ value, unit, label, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
      <div style={{
        width: 66, height: 66, borderRadius: "50%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(150deg, #ffffff, var(--green-wash))",
        boxShadow: "6px 6px 14px rgba(122,140,82,0.16), -5px -5px 12px rgba(255,255,255,0.92)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: accent || "var(--matcha-deep)", lineHeight: 1 }}>{value}</span>
        {unit ? <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{unit}</span> : null}
      </div>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.02em" }}>{label}</span>
    </div>
  );
}

/* ── Screen: Tonight (home) ── */
function ScreenTonight({ onOpen, onNav, onMood, onJournal, onBreathe }) {
  const [picked, setPicked] = React.useState(null);
  const moods = ["😔", "🙁", "😐", "🙂", "😌"];
  const quick = [
    { i: "feather", t: "Nhật ký", fn: onJournal },
    { i: "wind", t: "Hơi thở", fn: onBreathe },
    { i: "music", t: "Âm thanh", fn: () => onNav && onNav("audio") },
    { i: "message-circle", t: "Lắng nghe", fn: () => onNav && onNav("listen") },
  ];
  return (
    <div style={screenWrap}>
      <TopBar title="Tối nay" onBack={() => {}} trailingIcon="bell" />
      <div style={{ padding: "0 18px 8px" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>Chào buổi tối, Linh</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, color: "var(--foreground)", marginTop: 2, letterSpacing: "-0.02em", lineHeight: 1.15 }}>Hãy để hôm nay <span style={{ fontStyle: "italic", color: "var(--matcha-deep)" }}>lắng lại</span>.</h1>
      </div>

      {/* Misty hero */}
      <div style={{ position: "relative", margin: "12px 16px 0", height: 300, borderRadius: 30, overflow: "hidden", boxShadow: "0 24px 50px rgba(143,135,110,0.22)" }}>
        <MistyScene variant="dawn" />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 22 }}>
          <span style={{ alignSelf: "flex-start", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--matcha-text)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: 999 }}>Nghi thức tối</span>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#473a28", letterSpacing: "-0.02em", lineHeight: 1.15 }}>Thung lũng sương</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#6a5a44", marginTop: 4 }}>Soundscape · 18 phút</p>
            <button onClick={onOpen} style={{ marginTop: 16, width: "100%", border: "none", cursor: "pointer", borderRadius: 999, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--gradient-primary)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 26px rgba(95,111,82,0.34)" }}>
              <Icon name="play" size={16} color="#fff" /> Bắt đầu nghi thức
            </button>
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      <div style={{ margin: "16px 16px 0", borderRadius: 24, padding: "18px", background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 10px 26px rgba(143,135,110,0.1)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--foreground)" }}>Hôm nay bạn thế nào?</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {moods.map((e, i) => (
            <button key={i} onClick={() => { setPicked(i); onMood && onMood(i); }} style={{ flex: 1, aspectRatio: "1", borderRadius: 16, fontSize: 22, cursor: "pointer", border: picked === i ? "1.5px solid var(--matcha-deep)" : "1px solid var(--matcha-soft)", background: picked === i ? "var(--mood-high)" : "var(--surface-warm)" }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ margin: "14px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {quick.map((q) => (
          <button key={q.t} onClick={q.fn} style={{ border: "1px solid var(--border)", background: "var(--surface-card)", borderRadius: 18, padding: "14px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--matcha-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={q.i} size={18} color="var(--matcha-deep)" /></div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>{q.t}</span>
          </button>
        ))}
      </div>

      {/* Stats panel */}
      <div style={{ margin: "16px 16px 0", borderRadius: 26, padding: "20px 18px", background: "var(--gradient-mist)", boxShadow: "0 14px 34px rgba(122,140,82,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--foreground)" }}>Nhịp của bạn</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--matcha-deep)", fontWeight: 600 }}>Tuần này</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <StatDisc value="9" unit="ngày" label="Streak" accent="var(--honey-dark)" />
          <StatDisc value="3.8" unit="/5" label="Cảm xúc" />
          <StatDisc value="142" unit="phút" label="Tĩnh lặng" accent="var(--rose-deep)" />
        </div>
      </div>
      <div style={{ height: 104 }} />
    </div>
  );
}

/* ── Screen: Journey ── */
function ScreenJourney() {
  const days = Array.from({ length: 21 }, (_, i) => i + 1);
  const done = 12;
  return (
    <div style={screenWrap}>
      <TopBar title="Hành trình" onBack={() => {}} trailingIcon="calendar" />
      {/* Cool hero */}
      <div style={{ position: "relative", margin: "4px 16px 0", height: 220, borderRadius: 30, overflow: "hidden", boxShadow: "0 24px 50px rgba(110,120,110,0.22)" }}>
        <MistyScene variant="dusk" />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--matcha-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em" }}>Ngày 12 / 21</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 25, fontWeight: 400, color: "var(--green-deep)", letterSpacing: "-0.02em", marginTop: 4 }}>Bạn đang đi rất nhẹ nhàng.</h2>
        </div>
      </div>

      {/* Progress pill */}
      <div style={{ margin: "16px 16px 0", borderRadius: 18, padding: "14px 18px", background: "var(--gradient-warm)", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 24px rgba(235,200,114,0.3)" }}>
        <Icon name="sparkles" size={18} color="#7a5a18" />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#6a4f16", fontWeight: 600, flex: 1 }}>Còn 9 tối nữa để hoàn thành mùa Ngủ Sâu.</span>
      </div>

      {/* Calendar */}
      <div style={{ margin: "16px 16px 0", borderRadius: 26, padding: 18, background: "var(--surface-card)", boxShadow: "0 14px 34px rgba(143,135,110,0.12)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {days.map((d) => {
            const active = d <= done;
            return (
              <div key={d} style={{ aspectRatio: "1", borderRadius: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                background: active ? "var(--matcha-soft)" : "var(--surface-warm)", border: d === done ? "1.5px solid var(--matcha-deep)" : "1px solid transparent" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: active ? "var(--matcha-text)" : "var(--muted)" }}>{d}</span>
                {active ? <Icon name="check" size={10} color="var(--matcha-deep)" /> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stat discs */}
      <div style={{ margin: "16px 16px 0", borderRadius: 26, padding: "20px 18px", background: "var(--gradient-mist)", boxShadow: "0 14px 34px rgba(122,140,82,0.12)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <StatDisc value="58" unit="%" label="Hoàn thành" />
          <StatDisc value="6" unit="mùa" label="Đã trải" accent="var(--honey-dark)" />
          <StatDisc value="8.2" unit="/10" label="Chất lượng" accent="var(--rose-deep)" />
        </div>
      </div>
      <div style={{ height: 96 }} />
    </div>
  );
}

/* ── Screen: Player / breathing ── */
function ScreenPlayer({ onBack }) {
  return (
    <div style={{ ...screenWrap, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0 }}><MistyScene variant="dusk" /></div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(238,239,229,0.4) 0%, rgba(238,239,229,0.75) 60%, rgba(238,239,229,0.92) 100%)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <TopBar title="Đang phát" onBack={onBack} trailingIcon="heart" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
          <div className="lumia-animate-breathe-glow" style={{ width: 184, height: 184, borderRadius: "50%", background: "radial-gradient(circle at 32% 30%, #fff, var(--matcha) 75%)", boxShadow: "0 0 60px rgba(143,168,120,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="moon-star" size={52} color="var(--matcha-deep)" strokeWidth={1.2} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 25, fontWeight: 400, color: "var(--foreground)", marginTop: 34, letterSpacing: "-0.02em" }}>Thung lũng sương</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Hít vào · giữ · thở ra cùng vòng sáng</p>
          {/* progress */}
          <div style={{ width: "100%", marginTop: 30 }}>
            <div style={{ height: 5, borderRadius: 999, background: "rgba(143,135,110,0.2)", overflow: "hidden" }}>
              <div style={{ width: "38%", height: "100%", borderRadius: 999, background: "var(--gradient-primary)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>
              <span>06:48</span><span>18:00</span>
            </div>
          </div>
          {/* controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 26 }}>
            <button style={ctrlBtn}><Icon name="rotate-ccw" size={20} color="var(--matcha-deep)" /></button>
            <button style={{ ...ctrlBtn, width: 68, height: 68, background: "var(--gradient-primary)", boxShadow: "0 14px 30px rgba(95,111,82,0.4)" }}><Icon name="pause" size={26} color="#fff" /></button>
            <button style={ctrlBtn}><Icon name="rotate-cw" size={20} color="var(--matcha-deep)" /></button>
          </div>
        </div>
        <div style={{ height: 96 }} />
      </div>
    </div>
  );
}
const ctrlBtn = { width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: "0 4px 12px rgba(95,111,82,0.12)" };

const screenWrap = { minHeight: "100%", paddingTop: 52, background: "var(--background)" };

/* ── Bottom tab bar (frosted) ── */
function TabBar({ active, onNav }) {
  const tabs = [
    { id: "tonight", icon: "moon", label: "Tối nay" },
    { id: "audio", icon: "music", label: "Âm thanh" },
    { id: "listen", icon: "message-circle", label: "Lắng nghe" },
    { id: "journey", icon: "route", label: "Hành trình" },
    { id: "you", icon: "user", label: "Bạn" },
  ];
  return (
    <div style={{ position: "absolute", left: 12, right: 12, bottom: 18, zIndex: 40, display: "flex", padding: 7, borderRadius: 24,
      background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)",
      border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 14px 34px rgba(95,111,82,0.16)" }}>
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} style={{ flex: 1, border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 0" }}>
            <div style={{ width: 38, height: 28, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: on ? "var(--matcha-soft)" : "transparent" }}>
              <Icon name={t.icon} size={18} color={on ? "var(--matcha-deep)" : "var(--muted)"} strokeWidth={on ? 2 : 1.6} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: on ? 600 : 500, color: on ? "var(--matcha-deep)" : "var(--muted)" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { ScreenTonight, ScreenJourney, ScreenPlayer, TabBar, TopBar, StatDisc, screenWrap, glassBtn, ctrlBtn });
