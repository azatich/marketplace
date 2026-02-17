import { calculateDiscount } from "@/lib/calculateDiscount";
import { Product, ProductCategories } from "../types";
import { motion } from "framer-motion";
import { showSuccessToast } from "@/lib/toasts";

export const ProductCard = ({
  product,
  onAddToCart,
  onClick,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}) => {
  const discount = calculateDiscount(
    product.price,
    product.discount_price || 0,
  );
  const finalPrice = product.discount_price || product.price;
  const categoryObj =
    ProductCategories[product.category as keyof typeof ProductCategories];

  const subcategoryTitle =
    (categoryObj?.children as Record<string, string>)?.[product.subcategory] ||
    product.subcategory;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-300 my-2">{subcategoryTitle}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-white">
            ₸{finalPrice.toFixed(2)}
          </span>
          {product.discount_price && (
            <span className="text-sm text-[#A0AEC0] line-through">
              ₸{product.price.toFixed(2)}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
            showSuccessToast("Товар успешно добавлен в корзину", "");
          }}
          disabled={product.quantity === 0}
          className="w-full py-2 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.quantity === 0 ? "Нет в наличии" : "В корзину"}
        </motion.button>
      </div>
    </motion.div>
  );
};
