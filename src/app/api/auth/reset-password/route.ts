import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Gửi email đặt lại mật khẩu cho chính người đang đăng nhập.
 *
 * Route này TỪNG KHÔNG TỒN TẠI: nút "Đặt lại mật khẩu" trong trang Cài đặt gọi
 * `POST /api/auth/reset-password` mà `src/app/api/auth/` chỉ có login, logout và
 * register. Mỗi lần bấm là một cú 404, và vì phía client không kiểm tra phản hồi
 * nên giao diện vẫn hiện "đã gửi" — người dùng ngồi chờ một email không bao giờ
 * tới.
 *
 * Khác với /forgot-password (người dùng tự gõ email vì đang đăng xuất), ở đây
 * email lấy từ phiên đăng nhập — không nhận email từ body, để không ai dùng
 * endpoint này bắn thư tới địa chỉ của người khác.
 */
export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${getAppUrl()}/auth/reset-password`,
  });

  if (error) {
    console.error("[auth/reset-password] gửi email thất bại:", error.message);
    return NextResponse.json(
      { error: "Không gửi được email đặt lại mật khẩu. Vui lòng thử lại sau." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
