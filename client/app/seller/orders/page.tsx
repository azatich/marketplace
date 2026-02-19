"use client";

import { useState } from "react";
import { SellerOrderItem } from "@/features/seller";
import { useSellerOrders } from "@/features/seller/hooks/useSellerOrders";
import { SellerOrderCard } from "@/features/seller/ui/orders/OrderCard";
import { motion } from "framer-motion";
import { PackageOpen, Loader2, SearchX } from "lucide-react";

const ORDER_STATUSES = [
  { id: "all", label: "Все заказы" },
  { id: "processing", label: "В сборке" },
  { id: "shipped", label: "Отправлены" },
  { id: "delivered", label: "Доставлены" },
  { id: "cancelled", label: "Отменены" },
];

const SellerOrdersPage = () => {
  const { data: orderItems = [], isPending, isError } = useSellerOrders();
  
  // Состояние для текущего выбранного фильтра
  const [activeTab, setActiveTab] = useState("all");

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-[#8B7FFF] animate-spin mb-4" />
        <p className="text-[#A0AEC0]">Загружаем заказы покупателей...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 max-w-2xl mx-auto mt-10">
        <p className="font-semibold">Произошла ошибка при загрузке данных.</p>
        <p className="text-sm mt-1">Пожалуйста, обновите страницу или попробуйте позже.</p>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 max-w-4xl mx-auto mt-8"
      >
        <div className="w-24 h-24 bg-[#1A1F2E] rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
          <PackageOpen className="w-12 h-12 text-[#8B7FFF]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Нет товаров к отправке</h2>
        <p className="text-[#A0AEC0] max-w-md">
          Как только покупатели оформят заказ на ваши товары, они появятся на этой странице.
        </p>
      </motion.div>
    );
  }

  const activeOrdersCount = orderItems.filter(i => i.status === 'processing' || i.status === 'shipped').length;

  const filteredItems = activeTab === "all" 
    ? orderItems 
    : orderItems.filter(item => item.status === activeTab);

  return (
    <div className="container mx-auto space-y-8">
      
      {/* Шапка страницы */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Заказы покупателей</h1>
          <p className="text-[#A0AEC0]">Управляйте сборкой и доставкой ваших товаров</p>
        </div>
        <div className="px-4 py-2 bg-[#8B7FFF]/10 border border-[#8B7FFF]/20 rounded-lg">
          <span className="text-sm text-[#A0AEC0]">Активных отправлений: </span>
          <span className="text-lg font-bold text-[#8B7FFF]">{activeOrdersCount}</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 pb-2"
      >
        {ORDER_STATUSES.map((status) => {
          const count = status.id === "all" 
            ? orderItems.length 
            : orderItems.filter(i => i.status === status.id).length;

          return (
            <button
              key={status.id}
              onClick={() => setActiveTab(status.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                activeTab === status.id
                  ? "bg-[#8B7FFF] text-white border-[#8B7FFF] shadow-lg shadow-[#8B7FFF]/20"
                  : "bg-[#1A1F2E]/80 text-[#A0AEC0] border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {status.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === status.id ? "bg-white/20 text-white" : "bg-white/10 text-[#A0AEC0]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Список товаров */}
      {filteredItems.length === 0 ? (
        // Пустое состояние для конкретного фильтра
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="py-20 text-center bg-[#1A1F2E]/30 rounded-2xl border border-white/5"
        >
          <SearchX className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">В этой категории пусто</h3>
          <p className="text-[#A0AEC0] mt-1">Заказов с таким статусом пока нет.</p>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-6"
          initial="hidden"
          animate="visible"
          // Ключ заставляет анимацию запускаться заново при смене таба
          key={activeTab} 
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {filteredItems.map((item: SellerOrderItem) => (
            <SellerOrderCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SellerOrdersPage;