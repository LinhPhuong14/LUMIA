/**
 * Đơn cửa hàng (`store_orders`) — tách hẳn với đơn gói thành viên (`orders`).
 *
 * Hai bảng không gộp được: đơn gói cấp quyền dùng app và có `tier`, đơn cửa
 * hàng có giỏ sản phẩm vật lý và địa chỉ giao.
 */

export const STORE_PAYMENT_METHODS = ["cod", "payos"] as const;
export type StorePaymentMethod = (typeof STORE_PAYMENT_METHODS)[number];

export function isStorePaymentMethod(value: unknown): value is StorePaymentMethod {
  return typeof value === "string" && (STORE_PAYMENT_METHODS as readonly string[]).includes(value);
}

export const storePaymentMethodLabels: Record<StorePaymentMethod, string> = {
  cod: "Thanh toán khi nhận hàng",
  payos: "Chuyển khoản / QR",
};

export type StoreOrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export const storeOrderStatusLabels: Record<StoreOrderStatus, string> = {
  pending_payment: "Chờ xác nhận",
  paid: "Đã thanh toán",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
};

export function getStoreOrderStatusLabel(status: string): string {
  return storeOrderStatusLabels[status as StoreOrderStatus] ?? "Đang xử lý";
}

/**
 * Trạng thái khởi tạo.
 *
 * COD không có bước thanh toán online nào để chờ, nên `pending_payment` chỉ tạo
 * ra một hàng đợi giả mà không ai gỡ — đơn vào thẳng `preparing`. Tiền được thu
 * lúc giao, tức là khi đơn sang `delivered`.
 */
export function initialStatusFor(method: StorePaymentMethod): StoreOrderStatus {
  return method === "cod" ? "preparing" : "pending_payment";
}

/**
 * Khách còn tự huỷ được cho tới khi đơn rời kho.
 *
 * Mốc là `shipping`: từ lúc đó hàng đã ở tay đơn vị vận chuyển, huỷ trong app
 * không chặn được kiện hàng ngoài đời — chỉ tạo ra một đơn ghi "đã huỷ" trong
 * khi shipper vẫn đang gõ cửa. Sau mốc này khách phải gọi cho shop.
 */
const CANCELLABLE_STATUSES: StoreOrderStatus[] = ["pending_payment", "paid", "preparing"];

export function canCancelOrder(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status as StoreOrderStatus);
}

/** Lý do không huỷ được, để báo đúng việc thay vì một câu từ chối chung. */
export function describeCancelBlock(status: string): string {
  if (status === "cancelled") {
    return "Đơn này đã được huỷ trước đó.";
  }
  if (status === "delivered") {
    return "Đơn đã giao xong nên không huỷ được. Vui lòng liên hệ shop nếu cần đổi trả.";
  }
  if (status === "shipping") {
    return "Đơn đang trên đường giao nên không tự huỷ được. Vui lòng liên hệ shop để được hỗ trợ.";
  }
  return "Đơn ở trạng thái này không huỷ được.";
}

export type StoreOrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price_vnd: number;
  qty: number;
  variant?: string | null;
};

export type StoreOrderEntry = {
  id: string;
  status: StoreOrderStatus;
  paymentMethod: StorePaymentMethod;
  items: StoreOrderItem[];
  subtotalVnd: number;
  shippingVnd: number;
  totalVnd: number;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  note: string | null;
  createdAt: string;
  cancelledAt: string | null;
};

export type StoreOrderRow = {
  id: string;
  status: string;
  payment_method?: string | null;
  items: unknown;
  subtotal_vnd: number;
  shipping_vnd: number;
  total_vnd: number;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  note?: string | null;
  created_at: string;
  cancelled_at?: string | null;
};

export function mapStoreOrderRow(row: StoreOrderRow): StoreOrderEntry {
  return {
    id: row.id,
    status: (row.status as StoreOrderStatus) ?? "pending_payment",
    // Đơn tạo trước migration 027 không có cột này — coi là COD, đúng với luồng
    // cũ (shop gọi điện xác nhận rồi thu tiền lúc giao).
    paymentMethod: isStorePaymentMethod(row.payment_method) ? row.payment_method : "cod",
    items: Array.isArray(row.items) ? (row.items as StoreOrderItem[]) : [],
    subtotalVnd: row.subtotal_vnd,
    shippingVnd: row.shipping_vnd,
    totalVnd: row.total_vnd,
    shippingName: row.shipping_name ?? null,
    shippingPhone: row.shipping_phone ?? null,
    shippingAddress: row.shipping_address ?? null,
    note: row.note ?? null,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at ?? null,
  };
}

/** Cột chọn cho mọi chỗ đọc đơn cửa hàng — giữ một nơi để khỏi lệch nhau. */
export const STORE_ORDER_COLUMNS =
  "id, status, payment_method, items, subtotal_vnd, shipping_vnd, total_vnd, shipping_name, shipping_phone, shipping_address, note, created_at, cancelled_at";
