import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--background)]">
      {children}
    </div>
  );
}
