/** Map OAuth / auth callback error codes (from ?error=...) to friendly Vietnamese messages. */
const MESSAGES: Record<string, string> = {
  oauth_missing_code: "Không nhận được mã xác thực từ Google. Vui lòng thử đăng nhập lại.",
  oauth_server: "Hệ thống đăng nhập chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
  oauth_failed: "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
  oauth_denied: "Bạn đã hủy đăng nhập bằng Google.",
};

export function authErrorMessage(code?: string | null): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? "Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.";
}
