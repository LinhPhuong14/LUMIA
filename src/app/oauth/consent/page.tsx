import { redirect } from "next/navigation";

import { getSession } from "@/lib/supabase/auth";
import { ConsentClient } from "./consent-client";

export const metadata = {
  title: "Cấp quyền truy cập · LUMIA",
};

// Supabase OAuth 2.1 server redirects the user here (Authorization Path = /oauth/consent)
// with an ?authorization_id=... after the client app starts the authorization flow.
export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>;
}) {
  const { authorization_id: authorizationId } = await searchParams;

  if (!authorizationId) {
    return (
      <ConsentShell>
        <h1 className="font-serif text-2xl text-[var(--foreground)]">Yêu cầu không hợp lệ</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Thiếu mã yêu cầu cấp quyền. Vui lòng quay lại ứng dụng và thử lại.
        </p>
      </ConsentShell>
    );
  }

  // The consent decision must be made by a signed-in LUMIA user.
  const session = await getSession();
  if (!session) {
    const next = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <ConsentShell>
      <ConsentClient authorizationId={authorizationId} userEmail={session.email} />
    </ConsentShell>
  );
}

function ConsentShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4 py-10">
      <div className="hero-card w-full max-w-md p-6 md:p-8">{children}</div>
    </main>
  );
}
