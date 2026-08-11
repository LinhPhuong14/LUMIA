import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending_payment: "bg-champagne/40 text-honey-dark",
  paid: "bg-champagne/40 text-honey-dark",
  preparing: "bg-matcha-soft text-matcha-deep",
  shipping: "bg-blue-50 text-blue-700",
  delivered: "bg-success-soft text-success",
  // Trước đây rơi vào nhánh mặc định và hiện nguyên chữ "cancelled" — đơn cửa
  // hàng khách tự huỷ được nên trạng thái này giờ xuất hiện thường xuyên.
  cancelled: "bg-neutral-100 text-neutral-500",
};

const statusLabels: Record<string, string> = {
  pending_payment: "Chờ xác nhận",
  paid: "Đã thanh toán",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        statusStyles[status] ?? "bg-white/80 text-muted",
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
