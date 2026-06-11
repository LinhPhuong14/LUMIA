import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="marketing-page h-full overflow-hidden">
      <main className="page-scroll-area shell py-10 md:py-14">
        <Link href="/admin" className="text-sm font-medium text-muted transition hover:text-matcha-text">
          ← Quản trị
        </Link>
        <h1 className="mt-4 font-sans text-xl font-medium text-foreground md:text-2xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
