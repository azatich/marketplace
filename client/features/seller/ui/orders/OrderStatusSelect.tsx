"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Добавили импорт портала
import { Loader2, AlertTriangle } from "lucide-react";
import { OrderItemStatus } from "../../types";
import { useUpdateOrderItemStatus } from "../../hooks/useUpdateOrderItemStatus";
import { useHandleCancellation } from "../../hooks/useHandleCancellation";
import { AnimatePresence, motion } from "framer-motion";

const statusOptions: { value: OrderItemStatus; label: string }[] = [
  { value: "processing", label: "В сборке" },
  { value: "shipped", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
  { value: "cancelled", label: "Отменить заказ" },
];

export const OrderStatusSelect = ({ itemId, currentStatus }: { itemId: string; currentStatus: OrderItemStatus; }) => {
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderItemStatus();
  const { mutate: handleCancel, isPending: isCancelling } = useHandleCancellation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  // Состояние для проверки монтирования (нужно для Next.js при работе с порталами)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderItemStatus;
    
    if (newStatus === "cancelled") {
      e.target.value = currentStatus; 
      setIsModalOpen(true);
      return;
    }
    
    await updateStatus({ id: itemId, status: newStatus });
  };

  const handleSellerCancel = () => {
    handleCancel(
      { orderItemId: itemId, action: 'cancel_by_seller', reason: cancelReason || "Отменено продавцом" },
      { onSuccess: () => setIsModalOpen(false) }
    );
  };

  const getStatusColor = (s: OrderItemStatus) => {
    switch (s) {
      case "processing": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "shipped": return "text-[#8B7FFF] bg-[#8B7FFF]/10 border-[#8B7FFF]/20";
      case "delivered": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-white bg-white/10";
    }
  };

  const isPending = isUpdating || isCancelling;

  return (
    <>
      <div className="relative flex items-center">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={isPending || currentStatus === 'cancelled'}
          className={`appearance-none pl-4 pr-8 py-2 rounded-lg border text-sm font-medium outline-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(currentStatus)}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1A1F2E] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="absolute right-2.5 w-4 h-4 animate-spin text-current opacity-70 pointer-events-none" />
        ) : (
          <svg className="absolute right-2.5 w-4 h-4 text-current opacity-70 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Телепортируем модалку в document.body */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-[#1A1F2E] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md"
              >
                <div className="flex items-center gap-3 mb-4 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-white">Отмена заказа</h3>
                </div>
                <p className="text-sm text-[#A0AEC0] mb-4">
                  Пожалуйста, укажите причину отмены. Клиент увидит её в своем кабинете, и средства будут возвращены.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Например: Нет в наличии, брак на складе..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#8B7FFF]/50 resize-none h-24 mb-6"
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors">
                    Вернуться
                  </button>
                  <button 
                    onClick={handleSellerCancel}
                    disabled={!cancelReason.trim() || isCancelling}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                    Подтвердить отмену
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};