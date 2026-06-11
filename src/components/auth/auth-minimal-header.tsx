import Link from "next/link";

import { LumiaLogo } from "@/components/ui/logo";

export function AuthMinimalHeader() {
  return (
    <header
      className="absolute left-0 right-0 top-0 z-10 px-6 py-6 md:px-8"
      style={{ paddingTop: "calc(var(--safe-top) + 1.5rem)" }}
    >
      <Link href="/" aria-label="Về trang chủ LUMIA">
        <LumiaLogo />
      </Link>
    </header>
  );
}
