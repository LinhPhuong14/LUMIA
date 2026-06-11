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
    <div className="min-h-screen bg-background">
      <main className="shell py-10 md:py-14">
        <Link href="/admin" className="text-sm font-medium text-muted transition hover:text-matcha-deep">
          ← Quản trị
        </Link>
        <h1 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
