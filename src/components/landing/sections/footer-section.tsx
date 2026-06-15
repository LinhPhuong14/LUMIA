import Link from "next/link";

import { footerColumns } from "@/components/landing/data/landing-content";

export function FooterSection() {
  return (
    <footer className="site-footer border-t border-[var(--border)] bg-[var(--surface-warm)]">
      <div className="landing-frame py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="font-serif text-[26px] font-semibold text-[var(--green-deep)]">lumia</div>
            <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-[var(--muted)]">
              Một beauty wellness ritual dành cho những buổi tối cần chậm lại, mềm hơn và dịu hơn với chính mình.
            </p>
            <div className="mt-5 flex gap-2.5">
              {["IG", "FB"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[var(--border)] bg-surface-card text-xs font-medium text-[var(--muted)] shadow-[0_12px_26px_rgba(95,111,82,0.08)]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <div className="text-[14.5px] font-bold text-[var(--foreground)]">{col.title}</div>
              <div className="mt-4 grid gap-2.5">
                {col.links.map((link) => (
                  <Link key={link} href="/store" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--green-deep)]">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-11 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
          <span className="text-[12.5px] text-[var(--muted)]">
            LUMIA không thay thế chuyên gia y tế hay tâm lý.
          </span>
          <span className="text-[12.5px] text-[var(--muted)]">© 2026 LUMIA · EST. 2026</span>
        </div>
      </div>
    </footer>
  );
}
