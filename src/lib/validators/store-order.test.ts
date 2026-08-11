import { describe, expect, it } from "vitest";

import { describeStoreOrderError, storeOrderSchema } from "@/lib/validators/store-order";

/** Đi qua JSON đúng như request thật — `undefined` biến mất, `null` thì không. */
function parse(body: unknown) {
  return storeOrderSchema.safeParse(JSON.parse(JSON.stringify(body)));
}

const item = {
  product_id: "6f1c",
  slug: "set-khuech-tan-tinh-dau",
  name: "Set khuếch tán tinh dầu",
  price_vnd: 165000,
  qty: 1,
};

const order = {
  items: [item],
  shipping_name: "MinhQuan",
  shipping_phone: "0912345678",
  shipping_address: "so 1, hoang mai, ha noi",
  guest_email: "minhquan@gmail.com",
  note: "0",
};

describe("storeOrderSchema", () => {
  it("nhận sản phẩm không phân loại gửi lên variant = null", () => {
    // Đây là ca đã chặn đơn thật: CartItem.variant khai `string | null` và mọi
    // chỗ thêm vào giỏ đều ghi `?? null`, nên đơn nào có một món không phân loại
    // cũng bị từ chối trong khi khách nhìn thấy đã điền đủ.
    const result = parse({ ...order, items: [{ ...item, variant: null }] });
    expect(result.success).toBe(true);
  });

  it("nhận cả khi bỏ hẳn khoá variant", () => {
    expect(parse(order).success).toBe(true);
  });

  it("vẫn giữ được phân loại khi có", () => {
    const result = parse({ ...order, items: [{ ...item, variant: "Hương oải hương" }] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].variant).toBe("Hương oải hương");
    }
  });

  it("email bỏ trống không phải là lỗi", () => {
    expect(parse({ ...order, guest_email: "" }).success).toBe(true);
    expect(parse({ ...order, guest_email: null }).success).toBe(true);
  });

  it("ghi chú null không phải là lỗi", () => {
    expect(parse({ ...order, note: null }).success).toBe(true);
  });

  it("vẫn chặn thứ đáng chặn", () => {
    expect(parse({ ...order, items: [] }).success).toBe(false);
    expect(parse({ ...order, shipping_name: "   " }).success).toBe(false);
    expect(parse({ ...order, shipping_phone: "0912" }).success).toBe(false);
    expect(parse({ ...order, shipping_address: "abc" }).success).toBe(false);
    expect(parse({ ...order, guest_email: "khong-phai-email" }).success).toBe(false);
    expect(parse({ ...order, items: [{ ...item, price_vnd: -1 }] }).success).toBe(false);
    expect(parse({ ...order, items: [{ ...item, qty: 0 }] }).success).toBe(false);
    expect(parse({ ...order, items: [{ ...item, qty: 21 }] }).success).toBe(false);
  });
});

describe("describeStoreOrderError", () => {
  it("gọi tên đúng ô mà khách sửa được", () => {
    const result = parse({ ...order, shipping_phone: "091" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(describeStoreOrderError(result.error)).toContain("Số điện thoại");
    }
  });

  it("lỗi giỏ hàng chỉ ra được cách thoát, không đổ cho khách điền thiếu", () => {
    const result = parse({ ...order, items: [{ ...item, price_vnd: 0 }] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = describeStoreOrderError(result.error);
      expect(message).toContain("Giỏ hàng");
      expect(message).toContain("thêm lại");
    }
  });

  it("ô khách sửa được ưu tiên hơn lỗi giỏ hàng — hai việc phải làm khác nhau", () => {
    const result = parse({ ...order, shipping_name: "", items: [{ ...item, price_vnd: 0 }] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(describeStoreOrderError(result.error)).toContain("họ tên");
    }
  });
});
