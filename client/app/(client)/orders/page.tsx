"use client";

import { useClientOrders } from "@/features/client/hooks/useClientOrders";
import { OrderCard } from "@/features/client/ui/OrderCard";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import Link from "next/link";

const OrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useClientOrders();
  console.log(orders);
  

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#8B7FFF] animate-spin mb-4" />
        <p className="text-[#A0AEC0]">Загружаем ваши заказы...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-400">
        Произошла ошибка при загрузке заказов. Попробуйте позже.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 px-4 text-center"
      >
        <div className="w-20 h-20 bg-[#1A1F2E] rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
          <Package className="w-10 h-10 text-[#8B7FFF]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">У вас пока нет заказов</h2>
        <p className="text-[#A0AEC0] max-w-md mb-8">
          Кажется, вы еще ничего не заказали. Перейдите в каталог, чтобы найти что-то интересное!
        </p>
        <Link 
          href="/catalog"
          className="px-8 py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-xl text-white font-bold hover:shadow-lg hover:shadow-[#8B7FFF]/30 transition-all active:scale-95"
        >
          Перейти к покупкам
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-4 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Мои заказы</h1>
        <p className="text-[#A0AEC0]">История ваших покупок и статусы доставки</p>
      </motion.div>

      <motion.div 
        className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </motion.div>
    </div>
  );
};

export default OrdersPage;