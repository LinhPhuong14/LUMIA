"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/env";
import {
  validateEmail, validatePassword, validateConfirmPassword, validateName,
} from "@/lib/validators";

type AuthMode = "login" | "register";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// Inline error text below a field
function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-1 text-[12px] text-error">{msg}</p>;
}

// Whether a field has an error border
function fieldCls(err: string | null) {
  return err ? "border-red-400 focus:ring-red-200" : "";
}

export function AuthForm({ mode, next = "/dashboard", initialError = null }: { mode: AuthMode; next?: string; initialError?: string | null }) {
  const [serverError, setServerError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Controlled values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Touched state — only show errors after user has interacted with the field
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function touch(field: string) { setTouched(t => ({ ...t, [field]: true })); }
  function isTouched(field: string) { return !!touched[field]; }

  // Per-field errors (computed on every render)
  const nameErr = mode === "register" && isTouched("name") ? validateName(name) : null;
  const emailErr = isTouched("email") ? validateEmail(email) : null;
  const passwordErr = isTouched("password") ? validatePassword(password) : null;
  const confirmErr = mode === "register" && isTouched("confirm")
    ? validateConfirmPassword(password, confirmPassword) : null;

  // Also re-validate confirm when password changes
  const confirmLiveErr = mode === "register" && isTouched("confirm") && isTouched("password")
    ? validateConfirmPassword(password, confirmPassword) : confirmErr;

  const canOAuth = hasSupabaseConfig();

  async function handleOAuth(provider: "google") {
    if (!canOAuth) return;
    setOauthLoading(provider);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (oauthError) {
        setServerError("Đăng nhập qua mạng xã hội thất bại. Vui lòng thử lại.");
        setOauthLoading(null);
      }
    } catch {
      setServerError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setOauthLoading(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Touch all fields to reveal any hidden errors
    const fields: Record<string, boolean> = mode === "register"
      ? { name: true, email: true, password: true, confirm: true }
      : { email: true, password: true };
    setTouched(fields);

    // Client-side check
    if (mode === "register") {
      if (validateName(name) || validateEmail(email) || validatePassword(password) || validateConfirmPassword(password, confirmPassword)) return;
    } else {
      if (validateEmail(email) || validatePassword(password)) return;
    }

    setLoading(true);
    setServerError(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login"
      ? { email, password }
      : { name, email, password };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string; redirect?: string };

    if (!response.ok) {
      setServerError(result.error ?? "Đã có lỗi xảy ra.");
      setLoading(false);
      return;
    }

    window.location.assign(result.redirect ?? next);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form flex min-h-0 w-full flex-1 flex-col">
      <div className="auth-form-scroll flex-1 overflow-y-auto overscroll-contain px-4 pt-4 md:px-5 md:pt-5">
        <div>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-matcha-deep md:mt-4 md:text-4xl">
            {mode === "login" ? "Chào mừng bạn quay trở lại!" : "Tạo không gian LUMIA của riêng bạn."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {mode === "login"
              ? "Hãy lắng nghe bản thân hôm nay."
              : "Bạn có thể xóa dữ liệu cảm xúc và lịch sử trò chuyện bất cứ lúc nào."}
          </p>
        </div>

        {canOAuth ? (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading || oauthLoading !== null}
              className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-[14px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)] disabled:opacity-50"
            >
              {oauthLoading === "google"
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                : <GoogleIcon />}
              {mode === "login" ? "Đăng nhập" : "Đăng ký"} với Google
            </button>
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-[11px] font-medium text-muted">hoặc dùng email</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
          </div>
        ) : null}

        <div className={`mt-2 grid gap-3 ${mode === "register" ? "md:grid-cols-2" : ""}`}>
          {mode === "register" ? (
            <div>
              <Input
                name="name"
                label="Họ và tên"
                placeholder="Ví dụ: Linh Nguyễn"
                required
                value={name}
                onChange={e => { setName(e.target.value); if (isTouched("name") && !validateName(e.target.value)) touch("name"); }}
                onBlur={() => touch("name")}
                className={fieldCls(nameErr)}
              />
              <FieldError msg={nameErr} />
            </div>
          ) : null}

          <div>
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => touch("email")}
              className={fieldCls(emailErr)}
            />
            <FieldError msg={emailErr} />
          </div>

          <div>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                placeholder="Tối thiểu 8 ký tự"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                className={fieldCls(passwordErr)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute bottom-4 right-4 text-[12px] text-muted hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            <FieldError msg={passwordErr} />
            {mode === "login" ? (
              <a href="/forgot-password" className="mt-1 block self-end text-xs text-muted underline hover:text-foreground">
                Quên mật khẩu?
              </a>
            ) : null}
          </div>

          {mode === "register" ? (
            <div>
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onBlur={() => touch("confirm")}
                className={fieldCls(confirmLiveErr)}
              />
              <FieldError msg={confirmLiveErr} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="auth-form-footer shrink-0 space-y-3 border-t border-[var(--border)] bg-[var(--surface-card)]/80 px-4 py-4 backdrop-blur-sm md:px-5">
        <Button type="submit" disabled={loading || oauthLoading !== null} size="md" className="w-full justify-center">
          {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </Button>

        {serverError ? <p className="text-sm text-error">{serverError}</p> : null}

        {mode === "register" ? (
          <p className="text-center text-[13px] text-muted">
            Đã có tài khoản?{" "}
            <a href="/login" className="font-semibold text-[var(--green-deep)] underline underline-offset-2 hover:text-[var(--green)]">
              Đăng nhập
            </a>
          </p>
        ) : (
          <p className="text-center text-[13px] text-muted">
            Chưa có tài khoản?{" "}
            <a href="/register" className="font-semibold text-[var(--green-deep)] underline underline-offset-2 hover:text-[var(--green)]">
              Đăng ký miễn phí
            </a>
          </p>
        )}

        <p className="text-xs leading-6 text-muted">
          LUMIA không thay thế chuyên gia y tế hay chuyên gia tâm lý. Không gian này được thiết kế để lắng nghe một cách dịu dàng.
        </p>
      </div>
    </form>
  );
}
