/* LUMIA dashboard — shell + routing.
   Supports embedding: `?p=<page>` picks the initial page, and a
   `postMessage({ lumiaPage: <page> })` from a parent (e.g. the landing's
   webapp section) switches pages live. */
const DASH_PARAMS = new URLSearchParams(window.location.search);
function DashboardApp() {
  const [page, setPage] = React.useState(DASH_PARAMS.get("p") || "hub");
  React.useEffect(() => {
    const onMsg = (e) => { if (e.data && typeof e.data.lumiaPage === "string") setPage(e.data.lumiaPage); };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  let content = null;
  if (page === "hub") content = <PageHub />;
  else if (page === "listen") content = <PageListen />;
  else if (page === "journal") content = <PageJournal />;
  else if (page === "audio") content = <PageAudio />;
  else if (page === "coach") content = <PageCoach />;
  else if (page === "streak") content = <PageStreak />;
  else content = <PagePlan />;

  return (
    <div className="lumia-grain" style={{ position: "relative", display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#ffffff" }}>
      {/* ambient glow field */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(38% 46% at 10% 6%, rgba(176,216,166,0.55), transparent 62%), radial-gradient(34% 42% at 90% 14%, rgba(255,220,138,0.42), transparent 64%), radial-gradient(44% 50% at 82% 94%, rgba(143,201,140,0.46), transparent 64%), radial-gradient(40% 48% at 14% 92%, rgba(214,235,158,0.42), transparent 64%)" }} />
      <div aria-hidden="true" className="lumia-animate-float-slow" style={{ position: "absolute", top: "-8%", left: "30%", width: 360, height: 360, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, rgba(143,201,140,0.4), transparent 68%)", filter: "blur(20px)" }} />
      <div aria-hidden="true" className="lumia-animate-float-slow" style={{ position: "absolute", bottom: "-10%", left: "44%", width: 320, height: 320, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, rgba(255,220,138,0.34), transparent 68%)", filter: "blur(22px)", animationDelay: "2.2s" }} />
      <Sidebar active={page} onNav={setPage} />
      <main style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column", padding: "16px 28px 28px" }}>
        <div key={page} className="dash-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>{content}</div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardApp />);
