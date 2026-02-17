"use client";

import { SellerOrderItem } from "@/features/seller";
import { useSellerOrders } from "@/features/seller/hooks/useSellerOrders";
import { SellerOrderCard } from "@/features/seller/ui/orders/OrderCard";
import { motion } from "framer-motion";
import { PackageOpen, Loader2 } from "lucide-react";

const SellerOrdersPage = () => {
  const { data: orderItems = [], isPending, isError } = useSellerOrders();

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

  // Считаем общую статистику для шапки
  const activeOrders = orderItems.filter(i => i.status === 'processing' || i.status === 'shipped').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
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
          <span className="text-lg font-bold text-[#8B7FFF]">{activeOrders}</span>
        </div>
      </motion.div>

      {/* Список товаров (Анимация Stagger) */}
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {orderItems.map((item: SellerOrderItem) => (
          <SellerOrderCard key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

export default SellerOrdersPage;