import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  paid: "bg-champagne/40 text-honey-dark",
  preparing: "bg-matcha-soft text-matcha-deep",
  shipping: "bg-blue-50 text-blue-700",
  delivered: "bg-success-soft text-success",
};

const statusLabels: Record<string, string> = {
  paid: "Đã thanh toán",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
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
