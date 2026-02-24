import { Clock, CheckCircle, Package, Truck, XCircle, AlertCircle } from "lucide-react";
import { OrderItemStatus, OrderStatus } from "../types";

const statusConfig: Record<string, any> = {
  pending: { label: "Ожидает оплаты", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Clock },
  paid: { label: "Оплачен", color: "text-blue-500", bg: "bg-blue-500/10", icon: Package },
  processing: { label: "В сборке", color: "text-orange-500", bg: "bg-orange-500/10", icon: Package },
  shipped: { label: "В пути", color: "text-[#8B7FFF]", bg: "bg-[#8B7FFF]/10", icon: Truck },
  delivered: { label: "Доставлен", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  cancellation_requested: { label: "Ожидает отмены", color: "text-purple-400", bg: "bg-purple-400/10", icon: AlertCircle },
  cancelled: { label: "Отменен", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus | OrderItemStatus | string }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color} border border-current/10 w-fit`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs font-medium whitespace-nowrap">{config.label}</span>
    </div>
  );
};