import { useState } from "react";
import { Loader2 } from "lucide-react";
import { OrderItemStatus } from "../../types";
import { useUpdateOrderItemStatus } from "../../hooks/useUpdateOrderItemStatus";

const statusOptions: { value: OrderItemStatus; label: string }[] = [
  { value: "processing", label: "В сборке" },
  { value: "shipped", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
  { value: "cancelled", label: "Отменен" },
];

export const OrderStatusSelect = ({
  itemId,
  currentStatus,
}: {
  itemId: string;
  currentStatus: OrderItemStatus;
}) => {
  const { mutate: updateStatus, isPending } = useUpdateOrderItemStatus();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderItemStatus;
    await updateStatus({ id: itemId, status: newStatus });
  };

  const getStatusColor = (s: OrderItemStatus) => {
    switch (s) {
      case "processing":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "shipped":
        return "text-[#8B7FFF] bg-[#8B7FFF]/10 border-[#8B7FFF]/20";
      case "delivered":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "cancelled":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-white bg-white/10";
    }
  };

  return (
    <div className="relative flex items-center">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none pl-4 pr-8 py-2 rounded-lg border text-sm font-medium outline-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait ${getStatusColor(currentStatus)}`}
      >
        {statusOptions.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#1A1F2E] text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {isPending ? (
        <Loader2 className="absolute right-2.5 w-4 h-4 animate-spin text-current opacity-70 pointer-events-none" />
      ) : (
        <svg
          className="absolute right-2.5 w-4 h-4 text-current opacity-70 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      )}
    </div>
  );
};
