import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "../types";

interface CartState {
  cart: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find((item) => item.productId === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          // Проверка склада
          if (newQuantity > product.quantity) return;

          set({
            cart: cart.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: newQuantity }
                : item,
            ),
          });
        } else {
          // Проверка склада для нового товара
          if (quantity > product.quantity) return;

          set({
            cart: [...cart, { productId: product.id, quantity, product }],
          });
        }
      },

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { cart, removeFromCart } = get();

        if (quantity <= 0) {
          removeFromCart(productId);
          return;
        }

        const item = cart.find((i) => i.productId === productId);
        if (!item || quantity > item.product.quantity) return;

        set({
          cart: cart.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      // Логика вычислений
      getTotalItems: () => {
        return get().cart.length;
      },

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => {
          const price = item.product.discount_price || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getTotalDiscount: () => {
        return get().cart.reduce((total, item) => {
          if (item.product.discount_price) {
            const discount =
              (item.product.price - item.product.discount_price) *
              item.quantity;
            return total + discount;
          }
          return total;
        }, 0);
      },
    }),
    {
      name: "marketplace_cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
