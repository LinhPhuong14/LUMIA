import Script from "next/script";

const THEME_INIT = `
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("theme");
    var stored = localStorage.getItem("lumia-theme");
    var theme = (q === "light" || q === "dark")
      ? q
      : (stored === "light" || stored === "dark")
        ? stored
        : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export function ThemeInitScript() {
  return (
    <Script id="lumia-theme-init" strategy="beforeInteractive">
      {THEME_INIT}
    </Script>
  );
}
