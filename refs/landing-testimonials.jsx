/* LUMIA landing — testimonial scroll wall ("Được yêu mến bởi những LUMIERs").
   Adapted from the upstream repo's testimonials-section.tsx — 9 quotes in 3
   auto-scrolling columns (down · up · down), paused on hover. */

const LP_QUOTES = [
  { quote: "Lần đầu tiên trong nhiều tháng mình ngủ được thật sự. Cái nghi thức nhỏ đó đã thay đổi cả buổi tối của mình.", tag: "Hộp Khởi đầu" },
  { quote: "Mình không ngờ là chỉ cần viết ra vài dòng mà lòng nhẹ đến vậy. LUMIA như người bạn không phán xét.", tag: "Workspace" },
  { quote: "Cái hộp đến tay mình vào đúng một tuần rất khó. Mình đã khóc và cảm ơn vì điều đó.", tag: "Hộp Dịu sâu" },
  { quote: "AI của LUMIA lắng nghe theo cách mình chưa từng thấy ở bất kỳ app nào. Nó không cố sửa mình.", tag: "LUMIA lắng nghe" },
  { quote: "Từ khi có LUMIA, buổi tối của mình có một cái neo. Mình biết mình sẽ dừng lại ở đâu đó trong ngày.", tag: "Hộp Mỗi ngày" },
  { quote: "Mình mua tặng bạn thân và nó nhắn lại rằng đó là món quà ý nghĩa nhất năm nay.", tag: "Hộp Quà tặng" },
  { quote: "Nhật ký LUMIA giúp mình nhìn lại cảm xúc theo tuần. Mình thấy rõ mình hơn rất nhiều.", tag: "Workspace" },
  { quote: "Hương thơm trong hộp, ánh nến nhỏ, những thứ tưởng vô nghĩa lại tạo ra sự khác biệt thật sự.", tag: "Hộp Dịu sâu" },
  { quote: "Mình đã từng nghĩ mình không cần được lắng nghe. Bây giờ mình biết mình đã sai.", tag: "LUMIA lắng nghe" },
];

function QuoteCard({ q }) {
  return (
    <article style={{ marginBottom: 16, borderRadius: 24, background: "var(--surface-card)", border: "1px solid var(--border)", padding: "24px 24px 20px", boxShadow: "0 12px 30px rgba(95,111,82,0.08)" }}>
      <Icon name="quote" size={18} color="var(--green)" strokeWidth={2} />
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.7, color: "var(--foreground)", marginTop: 12 }}>{q.quote}</p>
      <span style={{ display: "inline-block", marginTop: 14, borderRadius: 999, background: "var(--green-wash)", color: "var(--green-deep)", fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, padding: "5px 12px" }}>{q.tag}</span>
    </article>
  );
}

function ScrollCol({ items, dir = "down", dur = "38s" }) {
  return (
    <div className="lp-col" style={{ position: "relative", height: 540, overflow: "hidden" }}>
      <div className={dir === "up" ? "lp-scroll-up" : "lp-scroll-down"} style={{ animationDuration: dur }}>
        {[...items, ...items].map((q, i) => (
          <QuoteCard key={i} q={q} />
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section id="cau-chuyen" data-screen-label="Câu chuyện" style={{ position: "relative", overflow: "hidden" }}>
      {/* soft honey + matcha glows behind the wall */}
      <div aria-hidden="true" style={{ position: "absolute", left: "8%", top: "26%", width: 480, height: 220, borderRadius: "50%", background: "rgba(255,220,138,0.22)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", right: "10%", bottom: "12%", width: 320, height: 320, borderRadius: "50%", background: "rgba(176,216,166,0.3)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "64px 40px 56px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={lpKicker}>— Câu chuyện</span>
          <h2 style={{ ...lpH2, maxWidth: "none" }}>Được yêu mến bởi những LUMIERs.</h2>
        </div>
        <div style={{ position: "relative" }}>
          {/* fade masks at top/bottom of the scroll wall */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110, zIndex: 2, pointerEvents: "none", background: "linear-gradient(180deg, var(--background) 12%, transparent 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, zIndex: 2, pointerEvents: "none", background: "linear-gradient(0deg, var(--background) 12%, transparent 100%)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <ScrollCol items={LP_QUOTES.slice(0, 3)} dir="down" dur="42s" />
            <ScrollCol items={LP_QUOTES.slice(3, 6)} dir="up" dur="36s" />
            <ScrollCol items={LP_QUOTES.slice(6, 9)} dir="down" dur="46s" />
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Testimonials });
