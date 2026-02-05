"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import ConfirmationPopUp from "@/components/ConfirmationPopUp";
import { useCartStore } from "@/features/client";
import CheckoutModal from "@/features/client/ui/CheckoutModal";
const CartPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Состояние для модалки Checkout

  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalDiscount,
  } = useCartStore();

  const isLoaded = useCartStore((state) => state._hasHydrated);

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#A0AEC0]">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <ShoppingCart className="w-24 h-24 text-[#A0AEC0] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
          <p className="text-[#A0AEC0] mb-6">Добавьте товары в корзину</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/catalog")}
            className="px-6 py-3 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all"
          >
            Перейти в каталог
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const totalDiscount = getTotalDiscount();
  const subtotal = totalPrice + totalDiscount;
  const delivery: number = 0;
  const finalTotal = totalPrice + delivery;

  function handleConfirmClear() {
    try {
      setConfirmLoading(true)
      clearCart()
      setConfirmOpen(false)
      showSuccessToast('Корзина успешно очищена', '')
    } catch (error) {
      showErrorToast('Ошибка при очистке корзины', '')
      setConfirmLoading(false)
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Модальное окно оформления заказа */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={finalTotal}
        cartItems={cart}
        clearCart={clearCart}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Корзина</h1>
            <p className="text-[#A0AEC0]">
              {cart.length} {cart.length === 1 ? "товар" : "товаров"}
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-[#FF6B6B] flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Очистить корзину
          </button>
        </div>
      </motion.div>

      <ConfirmationPopUp
        open={confirmOpen}
        title="Очистить корзину?"
        message={`Все товары с корзины будут удалены`}
        confirmText="Да"
        cancelText="Отмена"
        isLoading={confirmLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmClear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const finalPrice = item.product.discount_price || item.product.price;
            const discount = calculateDiscount(
              item.product.price,
              item.product.discount_price || 0
            );
            const isOutOfStock = item.product.quantity === 0;
            const exceedsStock = item.quantity > item.product.quantity;

            return (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div
                    className="w-24 h-24 shrink-0 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/product/${item.productId}`)}
                  >
                    <img
                      src={item.product.images[0] || "/placeholder.jpg"}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3
                          className="font-semibold mb-1 cursor-pointer hover:text-[#8B7FFF] transition-colors"
                          onClick={() => router.push(`/product/${item.productId}`)}
                        >
                          {item.product.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            ${finalPrice.toFixed(2)}
                          </span>
                          {item.product.discount_price && (
                            <>
                              <span className="text-sm text-[#A0AEC0] line-through">
                                ${item.product.price.toFixed(2)}
                              </span>
                              <span className="text-xs bg-[#FF6B6B]/20 text-[#FF6B6B] px-2 py-0.5 rounded">
                                -{discount}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#A0AEC0] hover:text-[#FF6B6B] transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={exceedsStock || isOutOfStock}
                          className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-lg font-semibold">
                          ${(finalPrice * item.quantity).toFixed(2)}
                        </p>
                        {exceedsStock && (
                          <p className="text-xs text-[#FF6B6B] mt-1">
                            Максимум: {item.product.quantity}
                          </p>
                        )}
                        {isOutOfStock && (
                          <p className="text-xs text-[#FF6B6B] mt-1">
                            Товар закончился
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 sticky top-24"
          >
            <h2 className="text-xl font-bold mb-6">Итого</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[#A0AEC0]">
                <span>Сумма товаров</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-[#FF6B6B]">
                  <span>Скидка</span>
                  <span>-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#A0AEC0]">
                <span>Доставка</span>
                <span>{delivery === 0 ? "Бесплатно" : `$${delivery.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>К оплате</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCheckoutOpen(true)} // Открываем модалку
              className="w-full py-3 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all"
            >
              Оформить заказ
            </motion.button>

            <button
              onClick={() => router.push("/catalog")}
              className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Продолжить покупки
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;