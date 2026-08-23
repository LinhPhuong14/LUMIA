"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { trackSignUp } from "@/lib/analytics";

/**
 * Bắn GA `sign_up` cho luồng đăng ký qua OAuth (Google).
 *
 * Vì sao cần: đăng ký bằng email bắn `sign_up` ngay trong client (auth-form),
 * nhưng OAuth đi vòng qua server callback (`/auth/callback`) rồi REDIRECT —
 * client bị huỷ giữa chừng nên không lệnh gtag nào chạy, và user tạo acc Free
 * bằng Google chỉ vào DB mà KHÔNG lên GA. Callback đánh dấu user mới bằng query
 * `?ga_signup=<method>`; ở đây đọc param đó, bắn `sign_up` đúng MỘT lần rồi xoá
 * param khỏi URL để không bắn lại khi refresh/chia sẻ link.
 */
const SIGNUP_PARAM = "ga_signup";

export function OAuthSignupTracker() {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) {
      return;
    }
    const method = searchParams.get(SIGNUP_PARAM);
    if (!method) {
      return;
    }
    fired.current = true;
    // gtag shim nằm inline trong HTML (GoogleAnalytics) nên đã sẵn sàng lúc
    // effect chạy; trackSignUp tự no-op nếu GA tắt.
    trackSignUp(method);

    // Xoá param bằng history.replaceState (không tạo điều hướng mới, không bắn
    // thêm page_view) để URL sạch và không bắn lại.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete(SIGNUP_PARAM);
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return null;
}
