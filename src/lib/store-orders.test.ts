import { describe, expect, it } from "vitest";

import {
  canCancelOrder,
  describeCancelBlock,
  getStoreOrderStatusLabel,
  initialStatusFor,
  mapStoreOrderRow,
  type StoreOrderRow,
} from "@/lib/store-orders";

const row: StoreOrderRow = {
  id: "3f1c9a20-0000-0000-0000-000000000000",
  status: "preparing",
  payment_method: "cod",
  items: [{ product_id: "p1", slug: "nen-thom", name: "Nến thơm", price_vnd: 260000, qty: 1 }],
  subtotal_vnd: 260000,
  shipping_vnd: 30000,
  total_vnd: 290000,
  shipping_name: "MinhQuan",
  shipping_phone: "0912345678",
  shipping_address: "so 1, hoang mai, ha noi",
  note: null,
  created_at: "2026-08-05T01:00:00Z",
  cancelled_at: null,
};

describe("initialStatusFor", () => {
  it("COD vào thẳng 'đang chuẩn bị' — không có thanh toán online nào để chờ", () => {
    expect(initialStatusFor("cod")).toBe("preparing");
  });

  it("chuyển khoản thì chờ thanh toán", () => {
    expect(initialStatusFor("payos")).toBe("pending_payment");
  });
});

describe("canCancelOrder", () => {
  it("huỷ được khi hàng chưa rời kho", () => {
    expect(canCancelOrder("pending_payment")).toBe(true);
    expect(canCancelOrder("paid")).toBe(true);
    expect(canCancelOrder("preparing")).toBe(true);
  });

  it("hết cửa huỷ từ lúc giao — huỷ trong app không chặn được kiện hàng ngoài đời", () => {
    expect(canCancelOrder("shipping")).toBe(false);
    expect(canCancelOrder("delivered")).toBe(false);
  });

  it("đơn đã huỷ không huỷ lại", () => {
    expect(canCancelOrder("cancelled")).toBe(false);
  });
});

describe("describeCancelBlock", () => {
  it("mỗi trạng thái chặn nói ra việc phải làm tiếp", () => {
    expect(describeCancelBlock("shipping")).toContain("liên hệ shop");
    expect(describeCancelBlock("delivered")).toContain("đổi trả");
    expect(describeCancelBlock("cancelled")).toContain("đã được huỷ");
  });
});

describe("mapStoreOrderRow", () => {
  it("đọc đủ giỏ hàng và địa chỉ giao", () => {
    const entry = mapStoreOrderRow(row);
    expect(entry.items).toHaveLength(1);
    expect(entry.totalVnd).toBe(290000);
    expect(entry.shippingPhone).toBe("0912345678");
    expect(entry.paymentMethod).toBe("cod");
  });

  it("đơn tạo trước migration 027 coi là COD, không phải rỗng", () => {
    // Luồng cũ không gọi PayOS và shop thu tiền lúc giao — đúng nghĩa COD.
    const legacy = mapStoreOrderRow({ ...row, payment_method: null });
    expect(legacy.paymentMethod).toBe("cod");
  });

  it("items hỏng không làm sập trang đơn hàng", () => {
    expect(mapStoreOrderRow({ ...row, items: null }).items).toEqual([]);
    expect(mapStoreOrderRow({ ...row, items: "{}" }).items).toEqual([]);
  });

  it("trạng thái lạ vẫn có nhãn đọc được", () => {
    expect(getStoreOrderStatusLabel("refunded")).toBe("Đang xử lý");
    expect(getStoreOrderStatusLabel("cancelled")).toBe("Đã huỷ");
  });
});
