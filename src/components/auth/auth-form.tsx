"use client";

import { useState } from "react";

type AuthMode = "login" | "register";

export function AuthForm({ mode, next = "/dashboard" }: { mode: AuthMode; next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (mode === "register") {
      const password = `${formData.get("password") ?? ""}`;
      const confirmPassword = `${formData.get("confirmPassword") ?? ""}`;

      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận chưa khớp.");
        setLoading(false);
        return;
      }
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? {
            email: formData.get("email"),
            password: formData.get("password"),
          }
        : {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string; redirect?: string };

    if (!response.ok) {
      setError(result.error ?? "Đã có lỗi xảy ra.");
      setLoading(false);
      return;
    }

    window.location.assign(result.redirect ?? next);
  }

  return (
    <form action={onSubmit} className="flex h-full w-full flex-col gap-4 overflow-hidden p-4 md:p-5">
      <div>
        
        <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">
          {mode === "login" ? "Chào mừng bạn quay trở lại!" : "Tạo không gian LUMIA của riêng bạn."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {mode === "login"
            ? "Hãy lắng nghe bản thân hôm nay."
            : "Bạn có thể xóa dữ liệu cảm xúc và lịch sử trò chuyện bất cứ lúc nào."}
        </p>
      </div>

      <div className={`grid gap-4 ${mode === "register" ? "md:grid-cols-2" : ""}`}>
        {mode === "register" ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-matcha-deep">
            Họ và tên
            <input
              name="name"
              className="rounded-[20px] border border-matcha-soft bg-white/92 px-4 py-3 outline-none ring-matcha/20 transition focus:ring-4"
              placeholder="Linh Nguyễn"
              required
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-medium text-matcha-deep">
          Email
          <input
            name="email"
            type="email"
            className="rounded-[20px] border border-matcha-soft bg-white/92 px-4 py-3 outline-none ring-matcha/20 transition focus:ring-4"
            placeholder="hello@lumia.vn"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-matcha-deep">
          Mật khẩu
          <input
            name="password"
            type="password"
            className="rounded-[20px] border border-matcha-soft bg-white/92 px-4 py-3 outline-none ring-matcha/20 transition focus:ring-4"
            placeholder="Tối thiểu 8 ký tự"
            required
          />
        </label>

        {mode === "register" ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-matcha-deep">
            Xác nhận mật khẩu
            <input
              name="confirmPassword"
              type="password"
              className="rounded-[20px] border border-matcha-soft bg-white/92 px-4 py-3 outline-none ring-matcha/20 transition focus:ring-4"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </label>
        ) : null}
      </div>

      

      <div className="mt-auto space-y-3">
        <button type="submit" disabled={loading} className="button-primary w-full justify-center disabled:opacity-60 mt-2">
          {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>

        {error ? <p className="text-sm text-[#9A5B5B]">{error}</p> : null}

        <p className="text-xs leading-6 text-muted">
          LUMIA không thay thế chuyên gia y tế hay chuyên gia tâm lý. Không gian này được thiết kế để lắng nghe một cách dịu dàng.
        </p>
      </div>
    </form>
  );
}
