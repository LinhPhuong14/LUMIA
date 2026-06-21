"use client";

import { useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/validators";

import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailErr = emailTouched ? validateEmail(email) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailTouched(true);
    const clientErr = validateEmail(email);
    if (clientErr) { setError(clientErr); return; }
    setLoading(true);
    setError(null);

    if (!hasSupabaseConfig()) {
      // Demo mode - just pretend success
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/reset-password`;

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (authError) {
        setError(authError.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-grid grid w-full flex-1 gap-6 lg:grid-cols-[1fr_0.94fr] lg:items-stretch">
      {/* Left decorative panel (visible on large screens only) */}
      <section
        className="relative hidden min-h-[min(100dvh,720px)] overflow-hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between"
        style={{ background: "var(--gradient-jade)" }}
      >
        <div className="relative max-w-xl pt-8">
          <h1
            className="font-serif text-5xl leading-[0.98] tracking-[-0.05em]"
            style={{ color: "var(--ink-on-light)" }}
          >
            Đặt lại mật khẩu LUMIA.
          </h1>
          <p className="mt-4 text-lg leading-8" style={{ color: "var(--scene-ink-muted)" }}>
            Nhập email của bạn và chúng tôi sẽ gửi đường dẫn để tạo mật khẩu mới.
          </p>
        </div>
        <div className="dash-panel relative p-6">
          <p className="text-sm leading-7" style={{ color: "var(--muted)" }}>
            Mật khẩu mới sẽ được thiết lập an toàn qua email xác nhận.
          </p>
        </div>
      </section>

      {/* Right form panel */}
      <div className="hero-card flex min-h-[min(100dvh,800px)] w-full flex-1 flex-col lg:max-h-[calc(100dvh-8rem)]">
        {success ? (
          <div className="auth-form flex min-h-0 w-full flex-1 flex-col">
            <div className="auth-form-scroll flex-1 overflow-y-auto overscroll-contain px-4 pt-4 md:px-5 md:pt-5">
              <div>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-matcha-deep md:mt-4 md:text-4xl">
                  Kiểm tra email của bạn.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Kiểm tra email của bạn để đặt lại mật khẩu. Đường dẫn có hiệu lực trong 60 phút.
                </p>
              </div>
            </div>
            <div className="auth-form-footer shrink-0 space-y-3 border-t border-[var(--border)] bg-[var(--surface-card)]/80 px-4 py-4 backdrop-blur-sm md:px-5">
              <Link
                href="/login"
                className="block w-full rounded-[var(--radius-md)] border border-[var(--border)] py-2 text-center text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]"
                style={{ color: "var(--green-deep)" }}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form flex min-h-0 w-full flex-1 flex-col">
            <div className="auth-form-scroll flex-1 overflow-y-auto overscroll-contain px-4 pt-4 md:px-5 md:pt-5">
              <div>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-matcha-deep md:mt-4 md:text-4xl">
                  Quên mật khẩu?
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu ngay lập tức.
                </p>
              </div>

              <div className="mt-6 grid gap-4">
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  required
                  className={emailErr ? "border-red-400 focus:ring-red-200" : ""}
                />
                {emailErr && <p className="mt-1 text-[12px] text-error">{emailErr}</p>}
              </div>
            </div>

            <div className="auth-form-footer shrink-0 space-y-3 border-t border-[var(--border)] bg-[var(--surface-card)]/80 px-4 py-4 backdrop-blur-sm md:px-5">
              <Button type="submit" disabled={loading} size="md" className="w-full justify-center">
                {loading ? "Đang gửi..." : "Gửi đường dẫn đặt lại"}
              </Button>

              {error ? <p className="text-sm text-error">{error}</p> : null}

              <p className="text-xs leading-6 text-muted">
                <Link href="/login" className="font-semibold" style={{ color: "var(--green-deep)" }}>
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
