import React, { useState } from "react";
import type { ProductItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToggleVisibility } from "../hooks/useToggleVisibility";
import { useDeleteMutation } from "../hooks/useDeleteMutation";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProductItem = ({ product }: { product: ProductItem }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { mutate: toggleVisibility, isPending: isPendingToggleVisibility } =
    useToggleVisibility();
  const { mutate: deleteProduct, isPending: isDeletingProduct } =
    useDeleteMutation();
  const router = useRouter();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const descriptionWords = product.description?.split(" ") ?? [];
  const isLongDescription = descriptionWords.length > 10 ;
  const truncatedDescription = isLongDescription
    ? descriptionWords.slice(0, 10).join(" ")
    : product.description;

  return (
    <div className="group relative rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 overflow-visible hover:border-white/10 hover:shadow-xl hover:shadow-[#8B7FFF]/10 transition-all">
      {!product.visibility && (
        <span className="absolute z-50 left-2 top-2 bg-black/60 backdrop-blur-sm rounded-full text-xs px-2 py-1">
          Продукт скрыт
        </span>
      )}

      {/* Карусель изображений */}
      <div
        onClick={() => router.push(`/seller/products/${product.id}`)}
        className="aspect-square overflow-hidden bg-white/5 rounded-t-xl relative hover:cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={
              product.images[currentImageIndex] ||
              "/images/product_placeholder.png"
            }
            alt={`${product.title} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {product.images.length > 1 && (
          <>
            {/* Левая стрелка */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>

            {/* Правая стрелка */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>

            {/* Индикаторы (точки) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Счетчик изображений */}
        {product.images.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {currentImageIndex + 1} / {product.images.length}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 mb-2">{product.title}</h3>

        <p className="text-gray-500 text-sm mb-4">
          {truncatedDescription}
          {isLongDescription && (
            <Link
              href={`/seller/products/${product.id}`}
              className="text-white hover:underline ml-1"
            >
              ...показать больше
            </Link>
          )}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-col">
            {product.discount_price && product.discount_price > 0 ? (
              <>
                <p className="text-sm text-gray-400 line-through tabular-nums">
                  {product.price} тг
                </p>
                <p className="text-xl text-[#8B7FFF] font-semibold tabular-nums">
                  {product.discount_price} тг
                </p>
              </>
            ) : (
              <p className="text-xl text-[#8B7FFF] font-semibold tabular-nums">
                {product.price} тг
              </p>
            )}
          </div>

          <p className="text-sm text-[#A0AEC0]">{product.quantity} в наличии</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1F2E] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-10 h-10 bg-[#8B7FFF]/20 text-[#8B7FFF] hover:bg-[#8B7FFF]/30 rounded-full transition-colors"
            title="Редактировать"
            onClick={() => router.push(`/seller/products/${product.id}`)}
          >
            <Edit className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title={product.visibility ? "Скрыть" : "Показать"}
            onClick={() => toggleVisibility(product.id)}
            disabled={isPendingToggleVisibility}
          >
            {product.visibility ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-10 h-10 bg-[#FF6B6B]/20 text-[#FF6B6B] hover:bg-[#FF6B6B]/30 rounded-full transition-colors"
            title="Удалить"
            onClick={() => deleteProduct(product.id)}
            disabled={isDeletingProduct}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
