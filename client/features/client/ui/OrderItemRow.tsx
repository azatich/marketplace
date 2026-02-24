"use client";

import { useState } from "react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { MessageSquare, Loader2, X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { OrderItem } from "../types";
import { useStartChat } from "../hooks/useStartChat";
import { useCancelOrderItem } from "../hooks/useCancelOrderItem";
import { motion, AnimatePresence } from "framer-motion";
import { useRequestCancellation } from "../hooks/useRequestCancellation";

export const OrderItemRow = ({ item }: { item: OrderItem }) => {
  const product = item.products;
  const imageUrl = product?.images?.[0] || "/placeholder.jpg";
  
  const { mutate: startChat, isPending: isChatPending } = useStartChat();
  const { mutate: cancelItem, isPending: isCancelling } = useRequestCancellation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) return;
    cancelItem(
      { orderItemId: item.id, reason: cancelReason },
      { onSuccess: () => setIsModalOpen(false) }
    );
  };

  const canBeCancelled = !['delivered', 'cancelled', 'cancellation_requested'].includes(item.status);

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ПРИЧИНЫ ОТМЕНЫ ---
  // Берем последний актуальный запрос (например, первый в массиве)
  const cancelReq = item.cancellation_requests?.[0]; 
  
  let cancelMessage = null;
  let cancelColor = "";
  let CancelIcon = AlertCircle;

  if (item.status === 'cancelled') {
    if (cancelReq?.initiated_by === 'seller') {
      cancelMessage = `Отменено продавцом: "${cancelReq.reason}"`;
      cancelColor = "bg-red-500/10 border-red-500/20 text-red-400";
    } else {
      cancelMessage = `Отмена подтверждена: "${cancelReq?.reason || 'Причина не указана'}"`;
      cancelColor = "bg-green-500/10 border-green-500/20 text-green-400";
      CancelIcon = Info;
    }
  } else if (item.status === 'cancellation_requested') {
    cancelMessage = `Запрос на отмену отправлен: "${cancelReq?.reason || 'Ожидает решения...'}"`;
    cancelColor = "bg-purple-500/10 border-purple-500/20 text-purple-400";
    CancelIcon = AlertTriangle;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 py-5 items-start sm:items-center group border-b border-white/5 last:border-0">
        <Link href={`/product/${item.product_id}`} className="shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/5 group-hover:border-[#8B7FFF]/50 transition-colors">
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link href={`/product/${item.product_id}`}>
            <h4 className="font-medium text-white mb-1 truncate group-hover:text-[#8B7FFF] transition-colors">
              {product.title}
            </h4>
          </Link>
          <div className="text-sm text-[#A0AEC0] flex flex-wrap gap-x-4 gap-y-1 mb-3">
            <span>Цена: ₸{item.price_at_purchase.toFixed(2)}</span>
            <span>Кол-во: {item.quantity} шт.</span>
          </div>

          {/* Плашка с причиной отмены */}
          {cancelMessage && (
            <div className={`mt-2 mb-3 p-3 rounded-xl border text-sm ${cancelColor}`}>
              <div className="flex items-start gap-2">
                <CancelIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{cancelMessage}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 items-center mt-2">
            <button 
              onClick={() => startChat(item.seller_id)}
              disabled={isChatPending}
              className="inline-flex items-center gap-2 text-sm text-[#8B7FFF] hover:text-[#6DD5ED] transition-colors disabled:opacity-50"
            >
              {isChatPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Связаться с продавцом
            </button>

            {canBeCancelled && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Отменить товар
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start shrink-0">
          <span className="font-bold text-white text-lg">
            ₸{(item.price_at_purchase * item.quantity).toFixed(2)}
          </span>
          <OrderStatusBadge status={item.status} />
        </div>
      </div>

      {/* Модальное окно (Портал не обязателен, если родитель без overflow-hidden, но для надежности можно оставить как есть) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#1A1F2E] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Отмена товара</h3>
              </div>
              <p className="text-sm text-[#A0AEC0] mb-4">
                Укажите причину отмены. Продавец рассмотрит ваш запрос и подтвердит возврат средств.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Например: Передумал покупать, нашел дешевле..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#8B7FFF]/50 resize-none h-24 mb-6"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Вернуться
                </button>
                <button 
                  onClick={handleCancelSubmit}
                  disabled={!cancelReason.trim() || isCancelling}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Отправить запрос
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};