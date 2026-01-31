"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ShoppingCart, Store, User } from "lucide-react";
import { useProduct } from "@/features/client/hooks/useProduct";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { ProductCategories } from "@/features/client/types";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";
import { useCartStore } from "@/features/client";

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(params.id as string);
  const { addToCart } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#A0AEC0]">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-[#A0AEC0] text-lg">Товар не найден</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 px-6 py-2 bg-[#8B7FFF] rounded-lg text-white hover:bg-[#6DD5ED] transition-colors"
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.discount_price || 0);
  const finalPrice = product.discount_price || product.price;
  const categoryData = ProductCategories[product.category as keyof typeof ProductCategories];
  const children = categoryData?.children as Record<string, string> | undefined;
  const categoryName = categoryData?.title || product.category;
  const subcategoryName = children?.[product.subcategory] || product.subcategory;

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      showErrorToast("Ошибка", "Недостаточно товара на складе");
      return;
    }
    addToCart(product, quantity);
    showSuccessToast("Успешно", "Товар добавлен в корзину");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#A0AEC0] hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Назад
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="relative aspect-square bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
            {product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-[#FF6B6B] text-white text-lg font-bold px-4 py-2 rounded">
                    -{discount}%
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#A0AEC0]">
                Нет изображения
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-[#8B7FFF]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-[#A0AEC0]">
              <span>{categoryName}</span>
              <span>•</span>
              <span>{subcategoryName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-white">
              ₸{finalPrice.toFixed(2)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-xl text-[#A0AEC0] line-through">
                  ₸{product.price.toFixed(2)}
                </span>
                <span className="text-lg text-[#FF6B6B] font-semibold">
                  Скидка {discount}%
                </span>
              </>
            )}
          </div>

          <div className="p-6 bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Описание</h2>
            <p className="text-[#A0AEC0] whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Seller Info */}
          {product.sellers && (
            <div className="p-6 bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Информация о продавце
              </h2>
              <div className="flex items-center gap-4">
                {product.sellers.avatarUrl ? (
                  <img
                    src={product.sellers.avatarUrl}
                    alt={product.sellers.storeName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{product.sellers.storeName}</p>
                  {product.sellers.users && (
                    <p className="text-sm text-[#A0AEC0]">
                      {product.sellers.users.first_name} {product.sellers.users.last_name} {}
                    </p>
                  )}
                  <p className="text-sm text-[#A0AEC0] mt-2">{product.sellers.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="p-6 bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm text-[#A0AEC0]">Количество:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), product.quantity));
                  }}
                  className="w-16 h-10 text-center bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
                />
                <button
                  onClick={() => setQuantity((prev) => Math.min(product.quantity, prev + 1))}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-[#A0AEC0]">
                В наличии: {product.quantity}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="w-full py-3 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.quantity === 0 ? "Нет в наличии" : "Добавить в корзину"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;

