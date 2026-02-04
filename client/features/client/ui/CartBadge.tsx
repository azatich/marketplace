import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCart";

export const CartBadge = () => {
  const { getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();

  if (cartItemsCount <= 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-4 bg-[#FF6B6B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
    >
      {cartItemsCount > 99 ? "99+" : cartItemsCount}
    </motion.span>
  );
};
