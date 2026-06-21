"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validatePassword, validateConfirmPassword } from "@/lib/validators";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function touch(f: string) { setTouched(t => ({ ...t, [f]: true })); }

  const passwordErr = touched.password ? validatePassword(password) : null;
  const confirmErr = touched.confirm
    ? validateConfirmPassword(password, confirmPassword) : null;
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // On mount, Supabase will automatically pick up the token from the URL hash
  // and exchange it for a session via onAuthStateChange.
  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event which Supabase fires when the
    // reset link is visited.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setSessionError(null);
      } else if (event === "SIGNED_IN") {
        // Some Supabase versions fire SIGNED_IN instead of PASSWORD_RECOVERY
        setSessionReady(true);
        setSessionError(null);
      }
    });

    // Also try to get the current session immediately in case the event
    // already fired before the listener was registered.
    supabase.auth.getSession().then(({ data, error: sessionErr }) => {
      if (sessionErr) {
        setSessionError("Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        return;
      }
      if (data.session) {
        setSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    setError(null);

    if (validatePassword(password) || validateConfirmPassword(password, confirmPassword)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message ?? "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  // Error state - invalid or expired link
  if (sessionError) {
    return (
      <div className="auth-page flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="hero-card w-full max-w-md p-8 text-center">
          <h2 className="font-serif text-2xl text-matcha-deep">Đường dẫn không hợp lệ</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{sessionError}</p>
          <a
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-semibold"
            style={{ color: "var(--green-deep)" }}
          >
            Yêu cầu đường dẫn mới
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="auth-page flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="hero-card w-full max-w-md p-8 text-center">
          <h2 className="font-serif text-2xl text-matcha-deep">Mật khẩu đã được đặt lại!</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Bạn đang được chuyển đến trang chính...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="auth-page flex min-h-dvh flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}
    >
      <div className="w-full max-w-md">
        <div className="hero-card flex w-full flex-col overflow-hidden">
          {!sessionReady ? (
            // Waiting for Supabase to exchange the token
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
              <p className="text-sm text-muted">Đang xác minh đường dẫn...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form flex min-h-0 w-full flex-1 flex-col">
              <div className="auth-form-scroll flex-1 overflow-y-auto overscroll-contain px-4 pt-4 md:px-5 md:pt-5">
                <div>
                  <h2 className="mt-2 font-serif text-3xl leading-tight text-matcha-deep md:mt-4 md:text-4xl">
                    Tạo mật khẩu mới.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Nhập mật khẩu mới cho tài khoản LUMIA của bạn.
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  <div>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Mật khẩu mới"
                        placeholder="Tối thiểu 8 ký tự"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => touch("password")}
                        required
                        className={passwordErr ? "border-red-400 focus:ring-red-200" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute bottom-4 right-4 text-[12px] text-muted hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? "Ẩn" : "Hiện"}
                      </button>
                    </div>
                    {passwordErr && <p className="mt-1 text-[12px] text-error">{passwordErr}</p>}
                  </div>

                  <div>
                    <Input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      label="Xác nhận mật khẩu"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => touch("confirm")}
                      required
                      className={confirmErr ? "border-red-400 focus:ring-red-200" : ""}
                    />
                    {confirmErr && <p className="mt-1 text-[12px] text-error">{confirmErr}</p>}
                  </div>
                </div>
              </div>

              <div className="auth-form-footer shrink-0 space-y-3 border-t border-[var(--border)] bg-[var(--surface-card)]/80 px-4 py-4 backdrop-blur-sm md:px-5">
                <Button type="submit" disabled={loading} size="md" className="w-full justify-center">
                  {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </Button>

                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
