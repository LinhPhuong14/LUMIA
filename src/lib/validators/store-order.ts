import { z } from "zod";

/**
 * Đơn hàng cửa hàng gửi lên từ giỏ hàng trong trình duyệt.
 *
 * Giỏ hàng nằm trong localStorage nên payload có thể mang hình dạng của một
 * phiên bản code cũ hơn — schema phải khoan dung đúng mức, và khi từ chối thì
 * phải nói được từ chối vì cái gì.
 */

/**
 * `nullish` chứ không phải `optional`.
 *
 * `CartItem.variant` khai báo `string | null` và mọi chỗ thêm vào giỏ đều ghi
 * `?? null` cho sản phẩm không có phân loại. JSON giữ nguyên `null`, mà
 * `.optional()` chỉ nhận `undefined` — nên mọi đơn có một món không phân loại
 * đều bị chặn ở đây, trong khi khách nhìn màn hình thấy đã điền đủ. Cùng lý do
 * cho email và ghi chú.
 */
const itemSchema = z.object({
  product_id: z.string().min(1),
  slug: z.string(),
  name: z.string(),
  price_vnd: z.number().int().positive(),
  qty: z.number().int().min(1).max(20),
  variant: z.string().nullish(),
});

export const storeOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  shipping_name: z.string().trim().min(1),
  shipping_phone: z.string().trim().min(8),
  shipping_address: z.string().trim().min(5),
  // Ô email để trống gửi lên chuỗi rỗng cũng phải qua: nó không bắt buộc.
  guest_email: z.union([z.string().trim().email(), z.literal("")]).nullish(),
  note: z.string().max(500).nullish(),
});

export type StoreOrderInput = z.infer<typeof storeOrderSchema>;

const FIELD_MESSAGES: Record<string, string> = {
  shipping_name: "Vui lòng nhập họ tên.",
  shipping_phone: "Số điện thoại chưa hợp lệ — cần ít nhất 8 chữ số.",
  shipping_address: "Địa chỉ quá ngắn, vui lòng ghi rõ số nhà, đường, phường, quận.",
  guest_email: "Email chưa hợp lệ.",
  note: "Ghi chú tối đa 500 ký tự.",
  items: "Giỏ hàng có sản phẩm không hợp lệ. Vui lòng xoá giỏ hàng rồi thêm lại.",
};

/**
 * Câu báo lỗi nói đúng chỗ hỏng.
 *
 * Trước đây mọi lỗi đều trả về "Vui lòng điền đầy đủ thông tin", kể cả khi chỗ
 * hỏng nằm trong `items` — thứ khách không nhìn thấy và không sửa được. Khách
 * điền đủ cả bốn ô, bấm Xác nhận, rồi bị bảo là điền thiếu; không có đường nào
 * thoát ra và cũng không có gì để báo lại cho shop.
 */
export function describeStoreOrderError(error: z.ZodError): string {
  const fields = error.issues.map((issue) => String(issue.path[0] ?? ""));
  // Ưu tiên ô khách sửa được; lỗi giỏ hàng để cuối vì nó cần hành động khác hẳn.
  const named = fields.find((field) => field !== "items" && FIELD_MESSAGES[field]);
  return FIELD_MESSAGES[named ?? ""] ?? FIELD_MESSAGES[fields[0] ?? ""] ?? "Dữ liệu đơn hàng không hợp lệ.";
}
