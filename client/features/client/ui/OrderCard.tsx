import { motion } from "framer-motion";
import { OrderItemRow } from "./OrderItemRow";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { MapPin} from "lucide-react";
import { Order } from "../types";

export const OrderCard = ({ order }: { order: Order }) => {
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(order.created_at));

  const shortId = order.id.split("-").pop()?.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="p-5 sm:p-6 border-b border-white/5 bg-white/2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-white">Заказ #{shortId}</h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-[#A0AEC0]">{formattedDate}</p>
        </div>
        
        <div className="flex flex-col sm:items-end w-full sm:w-auto gap-1">
          <span className="text-sm text-[#A0AEC0]">Сумма заказа</span>
          <span className="text-2xl font-bold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent">
            ${order.total_price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-3 border-b border-white/5 flex items-center gap-2 text-sm text-[#A0AEC0] bg-[#1A1F2E]">
        <MapPin className="w-4 h-4 text-[#8B7FFF] shrink-0" />
        <span className="truncate">Доставка: {order.shipping_address.value}</span>
      </div>

      <div className="px-5 sm:px-6 divide-y divide-white/5">
        {order.order_items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
};