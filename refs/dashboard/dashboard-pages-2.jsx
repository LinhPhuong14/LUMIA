/* LUMIA dashboard — pages: Âm thanh (audio), Sleep Coach, Streak & badges, Gói. */

/* ── 11 · Audio Library ── */
const AUDIO_GOALS = [["sleep","Ngủ","moon"],["calm","Bình tĩnh","heart"],["focus","Tập trung","target"],["restore","Phục hồi","battery-charging"],["breath","Breathwork","wind"],["nature","Thiên nhiên","trees"]];
const AUDIO_SLEEP = [{ t: "Thiền ngủ", d: "5 phút", g: "var(--gradient-jade)" }, { t: "Thiền sâu", d: "10 phút", g: "var(--gradient-emerald)" }, { t: "Body scan", d: "15 phút", g: "var(--gradient-honeyjade)" }];
const AUDIO_NATURE = [{ t: "Mưa nhẹ", d: "30 phút" }, { t: "Sóng biển", d: "30 phút" }, { t: "Rừng đêm", d: "30 phút" }];

function PageAudio() {
  const [goal, setGoal] = React.useState("sleep");
  return (
    <div style={dashPageWrap}>
      <TopBar title="Âm thanh" sub="Thư viện soundscape, thiền và breathwork." />
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        {/* goals nav */}
        <Panel title="Mục tiêu" pad={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {AUDIO_GOALS.map(([id, l, ic]) => {
              const on = goal === id;
              return (
                <button key={id} onClick={() => setGoal(id)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", border: "none", cursor: "pointer", borderRadius: 13, padding: "10px 12px",
                  fontFamily: "var(--font-body)", fontSize: 13, fontWeight: on ? 600 : 500, color: on ? "var(--green-deep)" : "var(--muted)", background: on ? "var(--green-wash)" : "transparent" }}>
                  <Icon name={ic} size={16} color={on ? "var(--green-deep)" : "var(--muted)"} /> {l}
                </button>
              );
            })}
          </div>
        </Panel>
        {/* content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "11px 16px" }}>
            <Icon name="search" size={17} color="var(--muted)" />
            <input placeholder="Tìm kiếm âm thanh, chủ đề…" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--foreground)" }} />
          </div>
          <Panel title="Thiền ngủ" pad={20} action={<a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--green-deep)" }}>Xem tất cả</a>}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {AUDIO_SLEEP.map((a) => (
                <div key={a.t} className="lumia-magnetic" style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", border: "1px solid var(--border)" }}>
                  <div className="lumia-grain" style={{ position: "relative", height: 96, background: a.g, display: "flex", alignItems: "flex-end", padding: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="play" size={15} color="var(--green-deep)" /></div>
                  </div>
                  <div style={{ padding: "12px 14px", background: "var(--surface-card)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }}>{a.t}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{a.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Thiên nhiên" pad={20}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {AUDIO_NATURE.map((a) => (
                <div key={a.t} className="lumia-magnetic" style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer", height: 120, display: "flex", alignItems: "flex-end", padding: 14 }}>
                  <div style={{ position: "absolute", inset: 0 }}><MistyScene variant={a.t === "Sóng biển" ? "dusk" : "dawn"} /></div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(47,58,40,0.5))" }} />
                  <div style={{ position: "relative" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{a.t}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>{a.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      {/* player bar */}
      <div className="lumia-glass" style={{ borderRadius: 20, padding: "12px 18px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gradient-jade)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="music" size={18} color="#fff" /></div>
        <div style={{ minWidth: 150 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Thiền ngủ 5 phút</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 1 }}>Guided · LUMIA</div>
        </div>
        {/* synced waveform */}
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 3, height: 28, flexShrink: 0 }}>
          {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => (
            <span key={i} className="lumia-animate-waveform" style={{ width: 3, height: 26, borderRadius: 2, background: "var(--green)", animationDelay: `${(i % 6) * 0.13}s`, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(122,140,82,0.18)", overflow: "hidden" }}><div style={{ width: "32%", height: "100%", background: "var(--green)" }} /></div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>01:36 / 05:00</span>
        <button style={{ width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="pause" size={17} color="#fff" /></button>
      </div>
    </div>
  );
}

/* ── 12 · Sleep Coach ── */
const COACH_ROUTINE = [["21:45","Tắt bớt màn hình"],["21:55","Breathwork 2 phút"],["22:05","Journal một dòng"],["22:10","Thiền ngủ 5 phút"],["22:20","Chuẩn bị ngủ"]];

function PageCoach() {
  const [level, setLevel] = React.useState(3);
  const moods = ["🙂","😮‍💨","😟","🙁","😶"];
  const [mood, setMood] = React.useState(0);
  return (
    <div style={dashPageWrap}>
      <TopBar title="Sleep Coach" sub="Một routine wind-down dịu dàng dẫn bạn vào giấc." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>
        {/* routine */}
        <Panel title="Routine tối nay">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {COACH_ROUTINE.map(([time, label], i) => (
              <div key={time} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: i === 0 ? "var(--green)" : "var(--matcha-soft)", border: i === 0 ? "none" : "2px solid var(--matcha)" }} />
                  {i < COACH_ROUTINE.length - 1 ? <div style={{ width: 2, height: 30, background: "var(--matcha-soft)" }} /> : null}
                </div>
                <div style={{ paddingBottom: 14 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--green-deep)" }}>{time}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--foreground)", marginTop: 1 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
          <button style={hubPrimaryBtn}>Bắt đầu wind-down</button>
        </Panel>
        {/* insights */}
        <Panel title="Insights của bạn">
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>Bạn ngủ tốt hơn vào những ngày nghe audio dưới 7 phút. Mood trước ngủ tuần này ổn định hơn.</p>
          <div className="lumia-grain" style={{ position: "relative", marginTop: 16, borderRadius: 18, overflow: "hidden", padding: "28px 20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 150 }}>
            <div style={{ position: "absolute", inset: 0 }}><MistyScene variant="dusk" /></div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(47,58,40,0.32), rgba(47,58,40,0.52))" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Giờ ngủ lý tưởng</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "#fff", lineHeight: 1.1, marginTop: 4 }}>22:15</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(255,255,255,0.92)", marginTop: 4 }}>Chất lượng giấc ngủ · 76%</div>
            </div>
          </div>
        </Panel>
        {/* check-in */}
        <Panel title="Check-in trước ngủ">
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Hôm nay bạn cảm thấy thế nào?</p>
          <div style={{ display: "flex", gap: 8 }}>
            {moods.map((e, i) => (
              <button key={i} onClick={() => setMood(i)} style={{ flex: 1, aspectRatio: "1", borderRadius: 14, fontSize: 20, cursor: "pointer", border: mood === i ? "1.5px solid var(--green)" : "1px solid var(--border)", background: mood === i ? "var(--green-wash)" : "var(--surface)" }}>{e}</button>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 8 }}><span>Mức độ (1–5)</span><span style={{ fontWeight: 700, color: "var(--green-deep)" }}>{level}</span></div>
            <input type="range" min="1" max="5" value={level} onChange={(e) => setLevel(+e.target.value)} style={{ width: "100%", accentColor: "var(--green)" }} />
          </div>
          <button style={hubPrimaryBtn}>Lưu check-in</button>
        </Panel>
      </div>
    </div>
  );
}

/* ── 13 · Streak & Badges ── */
const BADGES = [
  { t: "First Light", i: "sunrise", on: true }, { t: "Calm 3", i: "heart", on: true }, { t: "Soft Week", i: "calendar-check", on: true }, { t: "Deep Rest", i: "moon", on: true },
  { t: "Brave Journaler", i: "feather", on: false }, { t: "Sleep Starter", i: "bed", on: false }, { t: "Gentle Comeback", i: "rotate-ccw", on: false }, { t: "Signature Soul", i: "sparkles", on: false },
];
const WEEK = ["T2","T3","T4","T5","T6","T7","CN"];

function PageStreak() {
  return (
    <div style={dashPageWrap}>
      <TopBar title="Streak & huy hiệu" sub="Nhịp đều đặn của bạn, ghi nhận một cách nhẹ nhàng." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18, flex: 1, minHeight: 0 }}>
        <Panel pad={24}>
          <div className="lumia-grain" style={{ position: "relative", borderRadius: 20, overflow: "hidden", padding: "24px", background: "var(--gradient-honeyjade)", textAlign: "center" }}>
            <div style={{ position: "relative" }}>
              <Icon name="flame" size={30} color="#fff" style={{ justifyContent: "center" }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#fff", marginTop: 8 }}>Soft Week</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.92)", marginTop: 2 }}>7 ngày liên tiếp</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            {WEEK.map((d, i) => (
              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < 6 ? "var(--green)" : "var(--surface-warm)" }}>
                  {i < 6 ? <Icon name="check" size={14} color="#fff" /> : <Icon name="star" size={13} color="var(--muted)" />}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="lumia-grain" style={{ position: "relative", marginTop: 20, borderRadius: 18, overflow: "hidden", padding: "16px 18px", background: "var(--green-wash)" }}>
            <p style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 18, color: "var(--green-deep)", lineHeight: 1.35 }}>Không sao, hôm nay mình bắt đầu lại nhẹ nhàng.</p>
          </div>
        </Panel>
        <Panel title="Huy hiệu của bạn" action={<a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--green-deep)" }}>Xem tất cả</a>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {BADGES.map((b) => (
              <div key={b.t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: b.on ? "var(--gradient-jade)" : "var(--surface-warm)", opacity: b.on ? 1 : 0.6, boxShadow: b.on ? "0 10px 22px rgba(122,140,82,0.22)" : "none" }}>
                  <Icon name={b.i} size={24} color={b.on ? "#fff" : "var(--muted)"} strokeWidth={1.6} />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, color: b.on ? "var(--foreground)" : "var(--muted)" }}>{b.t}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── 14 · Subscription Management ── */
const PLAN_USAGE = [["AI Chat lắng nghe","Không giới hạn","message-circle"],["Mood test","Không giới hạn","activity"],["Audio thư viện","Full access","music"],["Sleep Coach","Cá nhân hóa","moon"]];

function PagePlan() {
  return (
    <div style={dashPageWrap}>
      <TopBar title="Gói của tôi" sub="Quản lý gói LUMIA và hộp vật lý của bạn." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1, minHeight: 0 }}>
        <Panel pad={24}>
          <span style={dashKicker}>Gói hiện tại</span>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "var(--foreground)", marginTop: 10 }}>Deep Ritual <span style={{ fontSize: 18, color: "var(--muted)" }}>(6 tháng)</span></div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--muted)", marginTop: 6 }}>Gia hạn: 02/07/2024 · 1.199.000đ / 6 tháng</div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button style={{ border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", borderRadius: 999, padding: "12px 22px", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--green-deep)" }}>Quản lý gói</button>
            <button style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "12px 22px", background: "var(--green)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600 }}>Đổi gói</button>
          </div>
          <div style={{ marginTop: 22, padding: "16px 18px", borderRadius: 16, background: "var(--green-wash)", display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="gift" size={18} color="var(--green-deep)" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--lumia-text-mid)", fontWeight: 600 }}>Ưu đãi: giảm 15–30% khi mua refill cho hộp vật lý.</span>
          </div>
        </Panel>
        <Panel title="Sử dụng hôm nay">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {PLAN_USAGE.map(([t, s, ic], idx, arr) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 2px", borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--green-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={17} color="var(--green-deep)" /></div>
                <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }}>{t}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--green-deep)", fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { PageAudio, PageCoach, PageStreak, PagePlan });
