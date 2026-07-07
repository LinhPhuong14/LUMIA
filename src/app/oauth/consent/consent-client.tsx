"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ClientInfo = { id: string; name: string; uri: string; logo_uri: string };

type Details = {
  authorization_id: string;
  redirect_uri: string;
  client: ClientInfo;
  scope: string;
};

// Friendly Vietnamese labels for the common OpenID scopes.
const SCOPE_LABELS: Record<string, string> = {
  openid: "Xác thực danh tính của bạn",
  profile: "Xem thông tin hồ sơ cơ bản (tên, ảnh đại diện)",
  email: "Xem địa chỉ email của bạn",
  offline_access: "Duy trì quyền truy cập khi bạn không online",
};

function scopeList(scope: string) {
  return scope
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => ({ key: s, label: SCOPE_LABELS[s] ?? s }));
}

export function ConsentClient({
  authorizationId,
  userEmail,
}: {
  authorizationId: string;
  userEmail: string;
}) {
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error: detailsError } =
          await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

        if (cancelled) return;

        if (detailsError || !data) {
          setError("Không tải được thông tin yêu cầu cấp quyền. Yêu cầu có thể đã hết hạn.");
          setLoading(false);
          return;
        }

        // Already consented before → Supabase returns a ready-to-use redirect URL.
        if ("redirect_url" in data) {
          window.location.href = data.redirect_url;
          return;
        }

        setDetails(data as Details);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authorizationId]);

  async function decide(decision: "approve" | "deny") {
    setSubmitting(decision);
    setError(null);
    try {
      const supabase = createClient();
      const fn =
        decision === "approve"
          ? supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
          : supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
      const { data, error: decideError } = await fn;

      if (decideError || !data?.redirect_url) {
        setError("Không thể xử lý lựa chọn của bạn. Vui lòng thử lại.");
        setSubmitting(null);
        return;
      }
      window.location.href = data.redirect_url;
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
        <p className="text-sm text-[var(--muted)]">Đang tải yêu cầu cấp quyền…</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="py-4">
        <h1 className="font-serif text-2xl text-[var(--foreground)]">Không thể tiếp tục</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--error)]">
          {error ?? "Yêu cầu không hợp lệ."}
        </p>
      </div>
    );
  }

  const scopes = scopeList(details.scope);
  const busy = submitting !== null;

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        {details.client.logo_uri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={details.client.logo_uri}
            alt={details.client.name}
            className="mb-4 h-14 w-14 rounded-2xl object-cover"
          />
        ) : (
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold"
            style={{ background: "var(--gradient-jade)", color: "var(--foreground)" }}
          >
            {details.client.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <h1 className="font-serif text-2xl leading-tight text-[var(--foreground)]">
          {details.client.name} muốn truy cập tài khoản LUMIA của bạn
        </h1>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          Đăng nhập với tư cách <span className="font-medium text-[var(--foreground)]">{userEmail}</span>
        </p>
      </div>

      <div className="mt-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Ứng dụng này sẽ được phép
        </p>
        <ul className="mt-3 space-y-2.5">
          {scopes.map((s) => (
            <li key={s.key} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green)]" />
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {details.client.uri ? (
        <p className="mt-3 text-center text-[12px] text-[var(--muted)]">
          Sau khi đồng ý, bạn sẽ được chuyển tới{" "}
          <span className="font-medium text-[var(--foreground)]">{details.client.uri}</span>
        </p>
      ) : null}

      {error ? <p className="mt-4 text-center text-sm text-[var(--error)]">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          type="button"
          onClick={() => decide("approve")}
          disabled={busy}
          size="md"
          className="w-full justify-center"
        >
          {submitting === "approve" ? "Đang xử lý…" : "Đồng ý và tiếp tục"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => decide("deny")}
          disabled={busy}
          size="md"
          className="w-full justify-center"
        >
          {submitting === "deny" ? "Đang xử lý…" : "Từ chối"}
        </Button>
      </div>

      <p className="mt-5 text-center text-[11px] leading-5 text-[var(--muted)]">
        Chỉ đồng ý nếu bạn tin tưởng ứng dụng này. LUMIA sẽ không chia sẻ mật khẩu của bạn.
      </p>
    </div>
  );
}
