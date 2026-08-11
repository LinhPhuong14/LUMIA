/**
 * Định giá đơn cửa hàng ở phía máy chủ.
 *
 * Trước đây `price_vnd` được lấy thẳng từ payload của trình duyệt rồi dùng để
 * tính `subtotal`/`total` và ghi vào DB. Sửa một số trong request là đặt được
 * đơn 425.000 ₫ với giá 1.000 ₫, và đơn đó vào hệ thống trông y hệt đơn thật —
 * không có bước nào đối chiếu lại với bảng giá.
 *
 * Giá, tên và slug giờ đọc từ `store_products`. Trình duyệt chỉ còn được nói
 * **mua cái gì, mấy cái** — không được nói giá bao nhiêu.
 */

/** Ship miễn phí từ 300.000 ₫ — cùng ngưỡng với phần hiển thị trong giỏ hàng. */
export const FREE_SHIPPING_FROM = 300_000;
export const SHIPPING_FEE = 30_000;

export function shippingFeeFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

/** Những gì trình duyệt gửi lên. `price_vnd` chỉ dùng để đối chiếu, không để tính. */
export type CartLineInput = {
  product_id: string;
  slug: string;
  name: string;
  price_vnd: number;
  qty: number;
  variant?: string | null;
};

/** Bản ghi thật trong `store_products`. */
export type PricingProduct = {
  id: string;
  slug: string;
  name: string;
  price_vnd: number;
  in_stock: boolean;
  variants: { name?: string | null }[];
};

/** Dòng đơn hàng đã được máy chủ định giá — đây mới là thứ ghi vào DB. */
export type PricedLine = {
  product_id: string;
  slug: string;
  name: string;
  price_vnd: number;
  qty: number;
  variant?: string | null;
};

export type PricingResult =
  | { ok: true; items: PricedLine[]; subtotal: number; shipping: number; total: number }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Danh sách id để tra bảng giá, đã lọc những chuỗi không phải UUID.
 *
 * `store_products.id` là UUID, nên một id bịa sẽ làm Postgres báo lỗi cú pháp
 * và cả request đổ thành 503 "không kiểm tra được giá" — che mất chuyện thật là
 * giỏ hàng có món không tồn tại. Lọc trước để `priceCart` từ chối bằng câu đúng.
 */
export function productIdsToLookUp(items: CartLineInput[]): string[] {
  return [...new Set(items.map((item) => item.product_id))].filter((id) => UUID_RE.test(id));
}

function variantNames(product: PricingProduct): string[] {
  return (Array.isArray(product.variants) ? product.variants : [])
    .map((variant) => (typeof variant?.name === "string" ? variant.name.trim() : ""))
    .filter(Boolean);
}

/**
 * Ghép giỏ hàng với bảng giá thật.
 *
 * Tách khỏi phần truy vấn để test được mà không cần dựng Supabase — logic đáng
 * kiểm ở đây là các quy tắc từ chối, không phải câu SELECT.
 */
export function priceCart(items: CartLineInput[], products: PricingProduct[]): PricingResult {
  const byId = new Map(products.map((product) => [product.id, product]));
  const priced: PricedLine[] = [];

  for (const line of items) {
    const product = byId.get(line.product_id);

    // Không tra được: sản phẩm đã bị xoá, bị ẩn (is_active = false), hoặc
    // product_id là bịa. Cả ba đều không được phép thành đơn.
    if (!product) {
      return {
        ok: false,
        error: `Sản phẩm "${line.name}" không còn được bán. Vui lòng xoá khỏi giỏ hàng rồi đặt lại.`,
      };
    }

    if (!product.in_stock) {
      return { ok: false, error: `Sản phẩm "${product.name}" đã hết hàng.` };
    }

    // Giá lệch = giỏ hàng cũ (shop vừa đổi giá) hoặc payload bị sửa. Từ chối cả
    // hai thay vì âm thầm tính theo giá thật: khách không bao giờ bị trừ một số
    // tiền khác với số họ nhìn thấy lúc bấm xác nhận.
    if (line.price_vnd !== product.price_vnd) {
      console.warn(
        "[store/pricing] price mismatch",
        JSON.stringify({ productId: product.id, sent: line.price_vnd, actual: product.price_vnd }),
      );
      return {
        ok: false,
        // Nói đúng việc phải làm: giỏ hàng nằm trong localStorage nên tải lại
        // trang KHÔNG cập nhật giá — phải xoá món đó rồi thêm lại.
        error:
          `Giá của "${product.name}" vừa thay đổi (nay là ${formatVnd(product.price_vnd)}). ` +
          `Vui lòng xoá sản phẩm khỏi giỏ hàng rồi thêm lại.`,
      };
    }

    // Phân loại phải là một trong những phân loại sản phẩm thật sự có — nếu
    // không, khách tự ghi được bất kỳ chữ gì vào phiếu đóng gói.
    const allowed = variantNames(product);
    const variant = line.variant?.trim() || null;
    if (variant && allowed.length > 0 && !allowed.includes(variant)) {
      return {
        ok: false,
        error: `Phân loại "${variant}" của "${product.name}" không còn khả dụng. Vui lòng chọn lại.`,
      };
    }

    priced.push({
      product_id: product.id,
      // Tên và slug cũng lấy từ DB: đơn hàng là chứng từ, không nên chứa chuỗi
      // do trình duyệt đặt ra.
      slug: product.slug,
      name: product.name,
      price_vnd: product.price_vnd,
      qty: line.qty,
      ...(variant ? { variant } : {}),
    });
  }

  const subtotal = priced.reduce((sum, line) => sum + line.price_vnd * line.qty, 0);
  const shipping = shippingFeeFor(subtotal);

  return { ok: true, items: priced, subtotal, shipping, total: subtotal + shipping };
}
