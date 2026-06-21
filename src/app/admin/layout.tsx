import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "color-mix(in srgb, var(--background) 50%, white)" }}>
      {children}
    </div>
  );
}
