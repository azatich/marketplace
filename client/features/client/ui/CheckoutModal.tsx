"use client";

import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { CreditCard, Loader2, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useClientProfile } from "../hooks/useClientProfile";
import { showErrorToast } from "@/lib/toasts";
import { useCreateOrder } from "../hooks/useCreateOrder";

const CheckoutModal = ({
  isOpen,
  onClose,
  totalAmount,
  cartItems,
  clearCart,
}: {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  cartItems: any[];
  clearCart: () => void;
}) => {
  const router = useRouter();
  const { data: profileData } = useClientProfile();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const addresses = profileData?.customers[0].addresses || [];

  // Убрали async, так как используем коллбэки React Query
  const handlePayment = () => {
    if (!selectedAddress) {
      showErrorToast("Ошибка", "Выберите адрес доставки");
      return;
    }

    const addressData = addresses.find((a: any) => a.id === selectedAddress);

    if (!addressData) {
      showErrorToast("Ошибка", "Выбранный адрес не найден");
      return;
    }

    const newOrder = {
      items: cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.product.discount_price || item.product.price,
      })),
      shipping_address: addressData,
      total_price: totalAmount,
      payment_method: "card_online",
    };

    // Передаем onSuccess прямо в функцию вызова
    createOrder(newOrder, {
      onSuccess: () => {
        clearCart(); // Очищаем корзину
        onClose(); // Закрываем модалку
        router.push("/orders"); // Перенаправляем клиента к его заказам
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#1A1F2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-[#A0AEC0] hover:text-white transition-colors"
                disabled={isCreatingOrder} // Блокируем крестик во время загрузки
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-[#a0aec0] mb-3 uppercase tracking-wider">
                    Адрес доставки
                  </h4>
                  {addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map((addr: any) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedAddress === addr.id
                              ? "bg-[#8B7FFF]/10 border-[#8B7FFF]"
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            className="mt-1"
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                            disabled={isCreatingOrder} // Блокируем выбор во время загрузки
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-white font-medium">
                              <MapPin className="w-4 h-4 text-[#8B7FFF]" />
                              {addr.value}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                      <p className="text-[#A0AEC0] mb-2">
                        Нет сохраненных адресов
                      </p>
                      <button
                        onClick={() => router.push("/profile")}
                        className="text-[#8B7FFF] hover:underline text-sm"
                      >
                        Добавить адрес в профиле
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm text-[#A0AEC0] mb-3 uppercase tracking-wider">
                    Способ оплаты
                  </h4>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[#8B7FFF] bg-[#8B7FFF]/10">
                    <CreditCard className="w-6 h-6 text-[#8B7FFF]" />
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        Банковская карта
                      </div>
                      <div className="text-xs text-[#A0AEC0]">
                        Visa •••• 4242
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-[#8B7FFF] border-4 border-[#1A1F2E]" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-[#A0AEC0]">К оплате:</span>
                  <span className="text-2xl font-bold text-white">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={!selectedAddress || isCreatingOrder}
                  className="w-full py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-[#8B7FFF]/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isCreatingOrder ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Оформить заказ"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;