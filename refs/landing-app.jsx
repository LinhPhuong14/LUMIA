/* LUMIA landing — assemble. */
function Landing() {
  return (
    <div style={{ ["--background"]: "#fdfdfa", ["--surface-warm"]: "#f6f3e9", background: "var(--background)" }}>
      <Hero />
      <Categories />
      <RitualAccordion />
      <BoxCatalog />
      <AiListening />
      <Stats />
      <WebappDemo />
      <MobileDemo />
      <Testimonials />
      <JoinBand />
      <SiteFooter />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Landing />);
