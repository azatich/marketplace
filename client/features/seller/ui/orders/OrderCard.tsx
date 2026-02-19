import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CalendarClock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { SellerOrderItem } from "../../types";
import { useStartChat } from "../../hooks/useStartChat";

export const SellerOrderCard = ({ item }: { item: SellerOrderItem }) => {
  const { products, orders, quantity, price_at_purchase } = item;
  const customer = orders.users;
  const phone = customer.customers?.[0]?.phone || "Не указан";
  const fullName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Без имени";

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(item.created_at));

  const totalEarnings = quantity * price_at_purchase;

  const { mutate: startChat, isPending } = useStartChat();

  console.log(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 sm:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start hover:border-white/10 transition-colors"
    >
      {/* 1. Блок Товара */}
      <div className="flex flex-col gap-4 items-start w-full lg:w-1/3">
        <div className="flex gap-4">
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-white/5">
            <img
              src={products.images?.[0] || "/placeholder.jpg"}
              alt={products.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1 line-clamp-2">
              {products.title}
            </h3>
            <div className="text-sm text-[#A0AEC0] space-y-1">
              <p>Цена: ₸{price_at_purchase.toFixed(2)}</p>
              <p className="font-medium text-white">Кол-во: {quantity} шт.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => startChat(item.orders.users.id)}
          disabled={isPending}
          className="inline-flex items-center gap-2 text-sm text-[#8B7FFF] hover:text-[#6DD5ED] transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          Связаться с клиентом
        </button>
      </div>

      {/* 2. Блок Клиента и Адреса */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="space-y-2">
          <p className="text-xs text-[#A0AEC0] uppercase tracking-wider mb-1">
            Покупатель
          </p>
          <div className="flex items-center gap-2 text-white">
            <User className="w-4 h-4 text-[#8B7FFF]" /> {fullName}
          </div>
          <div className="flex items-center gap-2 text-white">
            <Phone className="w-4 h-4 text-[#8B7FFF]" /> {phone}
          </div>
          <div className="flex items-center gap-2 text-white">
            <Mail className="w-4 h-4 text-[#8B7FFF]" /> {customer.email}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-[#A0AEC0] uppercase tracking-wider mb-1">
            Доставка
          </p>
          <div className="flex items-start gap-2 text-white">
            <MapPin className="w-4 h-4 text-[#8B7FFF] shrink-0 mt-0.5" />
            <span className="line-clamp-3">
              {orders.shipping_address.value}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#A0AEC0] mt-2 pt-2 border-t border-white/5">
            <CalendarClock className="w-4 h-4" /> Заказан: {formattedDate}
          </div>
        </div>
      </div>

      {/* 3. Блок Статуса и Денег */}
      <div className="w-full lg:w-48 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-4 shrink-0">
        <div className="text-left lg:text-right">
          <p className="text-xs text-[#A0AEC0] uppercase tracking-wider mb-1">
            Ваш доход
          </p>
          <p className="text-2xl font-bold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent">
            ₸{totalEarnings.toFixed(2)}
          </p>
        </div>

        {/* Выпадающий список изменения статуса */}
        <OrderStatusSelect itemId={item.id} currentStatus={item.status} />
      </div>
    </motion.div>
  );
};
