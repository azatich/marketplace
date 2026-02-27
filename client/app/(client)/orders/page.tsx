"use client";

import { useState } from "react";
import { OrderCard } from "@/features/client/ui/OrderCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Loader2,
  SearchX,
  CheckSquare,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useClientOrders, useHideOrders } from "@/features/client";

const TABS = [
  { id: "all", label: "Все заказы" },
  { id: "active", label: "Активные" },
  { id: "completed", label: "Завершенные" },
  { id: "cancelled", label: "Отмененные" },
];

const OrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useClientOrders();
  const { mutate: hideOrders, isPending: isHiding } = useHideOrders();

  const [activeTab, setActiveTab] = useState("active");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedOrderIds([]);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleDeleteSelected = () => {
    if (selectedOrderIds.length === 0) return;
    hideOrders(selectedOrderIds, { onSuccess: () => toggleSelectMode() });
  };

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
        Произошла ошибка при загрузке заказов.
      </div>
    );
  }

  const isOrderInTab = (order: any, tabId: string) => {
    if (tabId === "all") return true;

    const items = order.order_items || [];
    if (items.length === 0) return false;

    const hasActiveItems = items.some((i: any) =>
      [
        "pending",
        "paid",
        "processing",
        "shipped",
        "cancellation_requested",
      ].includes(i.status),
    );
    const isAllCancelled = items.every((i: any) => i.status === "cancelled");
    const isCompleted = !hasActiveItems && !isAllCancelled;

    if (tabId === "active") return hasActiveItems;
    if (tabId === "completed") return isCompleted;
    if (tabId === "cancelled") return isAllCancelled;

    return false;
  };

  // 1. Фильтруем заказы для текущей активной вкладки
  const filteredOrders = orders.filter((order) => isOrderInTab(order, activeTab));

  return (
    <div className="space-y-6 max-w-4xl px-4 mx-auto pt-4 pb-24 relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Мои заказы</h1>
          <p className="text-[#A0AEC0]">История ваших покупок</p>
        </div>

        {["completed", "cancelled"].includes(activeTab) &&
          filteredOrders.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`text-sm font-medium transition-colors ${isSelectMode ? "text-[#8B7FFF]" : "text-[#A0AEC0] hover:text-white"}`}
            >
              {isSelectMode ? "Отменить выбор" : "Удалить из истории"}
            </button>
          )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 pb-2"
      >
        {TABS.map((tab) => {
          const count = orders.filter((order) => isOrderInTab(order, tab.id)).length;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isSelectMode) toggleSelectMode();
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#8B7FFF] text-white border-[#8B7FFF] shadow-lg shadow-[#8B7FFF]/20"
                  : "bg-[#1A1F2E]/80 text-[#A0AEC0] border border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/10 text-current"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#1A1F2E]/30"
        >
          <SearchX className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-1">Здесь пусто</h3>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isSelected = selectedOrderIds.includes(order.id);
            return (
              <motion.div
                key={order.id}
                layout
                className="flex items-stretch gap-3"
              >
                <AnimatePresence>
                  {isSelectMode && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex items-center"
                    >
                      <button
                        onClick={() => toggleOrderSelection(order.id)}
                        className="p-2 -ml-2 text-[#A0AEC0] hover:text-[#8B7FFF] transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-6 h-6 text-[#8B7FFF]" />
                        ) : (
                          <Square className="w-6 h-6" />
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`flex-1 transition-all ${isSelected ? "ring-2 ring-[#8B7FFF]/50 rounded-2xl" : ""}`}
                  onClick={() => isSelectMode && toggleOrderSelection(order.id)}
                >
                  <div className={isSelectMode ? "pointer-events-none" : ""}>
                    <OrderCard order={order} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {isSelectMode && selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-4 bg-[#1A1F2E]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl"
          >
            <span className="text-white font-medium px-2">
              Выбрано: {selectedOrderIds.length}
            </span>
            <button
              onClick={handleDeleteSelected}
              disabled={isHiding}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isHiding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Удалить из истории
            </button>
            <div className="w-px h-8 bg-white/10 mx-1" />
            <button
              onClick={toggleSelectMode}
              className="p-2 text-[#A0AEC0] hover:text-white transition-colors bg-white/5 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;