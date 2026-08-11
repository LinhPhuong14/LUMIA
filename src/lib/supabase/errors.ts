/**
 * Nhận diện lỗi "bảng chưa tồn tại" của Supabase/PostgREST.
 *
 * Đây là kiểu hỏng hay gặp nhất trong repo này: lịch sử migration có lỗ (011
 * chưa từng chạy trên production, phải dựng lại bằng 019/020), nên một bảng nằm
 * trong `supabase/migrations/` không có nghĩa là nó có thật.
 *
 * Cái làm nó khó tìm không phải bản thân lỗi, mà là cách các route nuốt lỗi rồi
 * trả về một câu chung — "Không thể lưu phản hồi", hoặc tệ hơn, một danh sách
 * rỗng trông hệt như "bạn chưa có gì". Người dùng bấm nút, không có gì xảy ra,
 * và log cũng trống.
 */

export type SupabaseLikeError = { message: string; code?: string };

export function isMissingTableError(error: SupabaseLikeError | null | undefined): boolean {
  if (!error) {
    return false;
  }
  return (
    error.code === "42P01" ||
    /does not exist|schema cache|could not find the table/i.test(error.message)
  );
}

/** Cột chưa có — cùng họ với bảng chưa có, thường là migration chạy thiếu một cái. */
export function isMissingColumnError(error: SupabaseLikeError | null | undefined): boolean {
  if (!error) {
    return false;
  }
  return error.code === "42703" || /column .* does not exist/i.test(error.message);
}

/**
 * Câu báo lỗi chỉ thẳng vào migration cần chạy.
 *
 * `migration` là tên file trong `supabase/migrations/` — nói tên file cụ thể để
 * người đọc không phải đi dò xem bảng đó sinh ra từ đâu.
 */
export function describeSchemaError(
  error: SupabaseLikeError,
  migration: string,
): string {
  if (isMissingTableError(error) || isMissingColumnError(error)) {
    return `Chưa chạy migration ${migration} trong Supabase SQL Editor.`;
  }
  return error.message;
}
