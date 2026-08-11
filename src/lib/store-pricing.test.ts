import { describe, expect, it, vi } from "vitest";

import {
  priceCart,
  productIdsToLookUp,
  shippingFeeFor,
  type CartLineInput,
  type PricingProduct,
} from "@/lib/store-pricing";

const CANDLE_ID = "11111111-1111-4111-8111-111111111111";
const DIFFUSER_ID = "22222222-2222-4222-8222-222222222222";

const candle: PricingProduct = {
  id: CANDLE_ID,
  slug: "nen-thom",
  name: "Nến thơm",
  price_vnd: 260000,
  in_stock: true,
  variants: [{ name: "Oải hương" }, { name: "Cam bergamot" }],
};

const diffuser: PricingProduct = {
  id: DIFFUSER_ID,
  slug: "set-khuech-tan-tinh-dau",
  name: "Set khuếch tán tinh dầu",
  price_vnd: 165000,
  in_stock: true,
  variants: [],
};

function line(overrides: Partial<CartLineInput> = {}): CartLineInput {
  return {
    product_id: CANDLE_ID,
    slug: "nen-thom",
    name: "Nến thơm",
    price_vnd: 260000,
    qty: 1,
    ...overrides,
  };
}

describe("priceCart", () => {
  it("bỏ qua giá client gửi lên, tính bằng giá trong DB", () => {
    // Đây là lỗ hổng đã sửa: sửa price_vnd trong request là mua được giá bèo.
    const tampered = line({ price_vnd: 1000 });
    const result = priceCart([tampered], [candle]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("vừa thay đổi");
    // Giỏ hàng nằm trong localStorage nên "tải lại trang" là lời khuyên sai —
    // câu báo phải bảo khách xoá món đó rồi thêm lại.
    expect(result.error).toContain("xoá sản phẩm khỏi giỏ hàng");
    expect(result.error).toContain("260.000");
  });

  it("không bao giờ ghi giá của client vào đơn", () => {
    const result = priceCart([line({ qty: 2 })], [candle]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.items[0].price_vnd).toBe(260000);
    expect(result.subtotal).toBe(520000);
    // ≥ 300.000 nên miễn phí ship.
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(520000);
  });

  it("tên và slug lấy từ DB, không phải từ trình duyệt", () => {
    const spoofed = line({ name: "Quà tặng miễn phí", slug: "hacked" });
    const result = priceCart([spoofed], [candle]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].name).toBe("Nến thơm");
    expect(result.items[0].slug).toBe("nen-thom");
  });

  it("cộng phí ship khi chưa đạt ngưỡng", () => {
    const result = priceCart([{ ...line({ product_id: DIFFUSER_ID }), price_vnd: 165000 }], [diffuser]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subtotal).toBe(165000);
    expect(result.shipping).toBe(30000);
    expect(result.total).toBe(195000);
  });

  it("từ chối sản phẩm không tra được — đã xoá, đã ẩn, hoặc id bịa", () => {
    const result = priceCart([line()], []);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("không còn được bán");
  });

  it("từ chối sản phẩm hết hàng", () => {
    const result = priceCart([line()], [{ ...candle, in_stock: false }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("hết hàng");
  });

  it("ghi lại dấu vết khi giá lệch, để còn phân biệt giỏ cũ với payload bị sửa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    priceCart([line({ price_vnd: 1 })], [candle]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("chỉ nhận phân loại sản phẩm thật sự có", () => {
    const ok = priceCart([line({ variant: "Oải hương" })], [candle]);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.items[0].variant).toBe("Oải hương");

    const bogus = priceCart([line({ variant: "Tặng kèm 5 hộp" })], [candle]);
    expect(bogus.ok).toBe(false);
    if (!bogus.ok) expect(bogus.error).toContain("không còn khả dụng");
  });

  it("sản phẩm không có phân loại thì bỏ qua phân loại client gửi", () => {
    const result = priceCart(
      [line({ product_id: DIFFUSER_ID, price_vnd: 165000, variant: null })],
      [diffuser],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].variant).toBeUndefined();
  });

  it("nhiều dòng cộng đúng tổng", () => {
    const result = priceCart(
      [
        line({ variant: "Oải hương" }),
        line({ product_id: DIFFUSER_ID, price_vnd: 165000, qty: 1 }),
      ],
      [candle, diffuser],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subtotal).toBe(425000);
    expect(result.shipping).toBe(0);
  });
});

describe("productIdsToLookUp", () => {
  it("lọc id không phải UUID để câu truy vấn không nổ", () => {
    const ids = productIdsToLookUp([
      line(),
      line({ product_id: "'; DROP TABLE store_products; --" }),
      line({ product_id: "abc" }),
    ]);
    expect(ids).toEqual([CANDLE_ID]);
  });

  it("bỏ trùng", () => {
    expect(productIdsToLookUp([line(), line()])).toEqual([CANDLE_ID]);
  });
});

describe("shippingFeeFor", () => {
  it("miễn phí từ đúng ngưỡng 300.000", () => {
    expect(shippingFeeFor(299999)).toBe(30000);
    expect(shippingFeeFor(300000)).toBe(0);
  });
});
