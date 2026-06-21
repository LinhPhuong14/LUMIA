// Shared client-side validators — return string error or null

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^(0|\+84)\d{8,10}$/;
export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateEmail(v: string): string | null {
  if (!v.trim()) return "Vui lòng nhập email.";
  if (!EMAIL_RE.test(v)) return "Email không hợp lệ.";
  return null;
}

export function validatePassword(v: string): string | null {
  if (!v) return "Vui lòng nhập mật khẩu.";
  if (v.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  return null;
}

export function validateConfirmPassword(pw: string, confirm: string): string | null {
  if (!confirm) return "Vui lòng xác nhận mật khẩu.";
  if (pw !== confirm) return "Mật khẩu xác nhận chưa khớp.";
  return null;
}

export function validateName(v: string): string | null {
  if (!v.trim()) return "Vui lòng nhập họ tên.";
  if (v.trim().length < 2) return "Tên phải có ít nhất 2 ký tự.";
  return null;
}

export function validatePhone(v: string): string | null {
  const clean = v.replace(/\s/g, "");
  if (!clean) return "Vui lòng nhập số điện thoại.";
  if (!PHONE_RE.test(clean)) return "Số điện thoại không hợp lệ (ví dụ: 0912345678).";
  return null;
}

export function validateRequired(v: string, label: string): string | null {
  if (!v.trim()) return `Vui lòng nhập ${label}.`;
  return null;
}

export function validateTimeGoal(v: string): string | null {
  if (!v) return null; // optional
  if (!TIME_RE.test(v)) return "Định dạng giờ không hợp lệ (ví dụ: 22:30).";
  return null;
}
