"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid, List, Filter, X, ChevronDown } from "lucide-react";
import { useProducts } from "@/features/client/hooks/useProducts";
import { ProductCategories, ProductFilters } from "@/features/client/types";
import { Product } from "@/features/client/types";
import { useRouter } from "next/navigation";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { showSuccessToast } from "@/lib/toasts";
import { useCartStore } from "@/features/client";

const CatalogPage = () => {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20, 
  });

  const { data, isLoading } = useProducts(filters);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSortChange = (sortBy: "price" | "created_at" | "discount", order: "asc" | "desc") => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: order }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Каталог товаров</h1>
        <p className="text-[#A0AEC0]">Найдите то, что вам нужно</p>
      </motion.div>

      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder="Поиск по названию, описанию..."
            value={filters.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Фильтры
            {showFilters && (
              <X className="w-4 h-4 ml-2" />
            )}
          </motion.button>

          <div className="flex items-center gap-2">
            <select
              value={`${filters.sortBy || "created_at"}-${filters.sortOrder || "desc"}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                handleSortChange(sortBy as any, sortOrder as any);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
            >
              <option className="bg-[#1A1F2E] text-white" value="created_at-desc">По новизне (новые)</option>
              <option className="bg-[#1A1F2E] text-white" value="created_at-asc">По новизне (старые)</option>
              <option className="bg-[#1A1F2E] text-white" value="price-asc">По цене (возрастание)</option>
              <option className="bg-[#1A1F2E] text-white" value="price-desc">По цене (убывание)</option>
              <option className="bg-[#1A1F2E] text-white" value="discount-desc">По размеру скидки</option>
            </select>

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#8B7FFF]/20 text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-[#8B7FFF]/20 text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-6 bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Фильтры</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-[#8B7FFF] hover:text-[#6DD5ED] transition-colors"
            >
              Сбросить
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Категория
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
              >
                <option value="">Все категории</option>
                {Object.entries(ProductCategories).map(([key, value]) => (
                  <option key={key} value={key} className="bg-[#1A1F2E]">
                    {value.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            {filters.category && (
              <div>
                <label className="block text-sm text-[#A0AEC0] mb-2">
                  Подкатегория
                </label>
                <select
                  value={filters.subcategory || ""}
                  onChange={(e) => handleFilterChange("subcategory", e.target.value || undefined)}
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
                >
                  <option value="">Все подкатегории</option>
                  {Object.entries(
                    ProductCategories[filters.category as keyof typeof ProductCategories]?.children || {}
                  ).map(([key, value]) => (
                    <option key={key} value={key} className="bg-[#1A1F2E]">
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Цена от
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Цена до
              </label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
              />
            </div>
          </div>

          {/* Discount Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasDiscount"
              checked={filters.hasDiscount || false}
              onChange={(e) => handleFilterChange("hasDiscount", e.target.checked || undefined)}
              className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#8B7FFF] focus:ring-[#8B7FFF]/50"
            />
            <label htmlFor="hasDiscount" className="text-sm text-[#A0AEC0] cursor-pointer">
              Только товары со скидкой
            </label>
          </div>
        </motion.div>
      )}

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#A0AEC0]">Загрузка...</div>
        </div>
      ) : data?.products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#A0AEC0] text-lg">Товары не найдены</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {data?.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onClick={() => router.push(`/product/${product.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onClick={() => router.push(`/product/${product.id}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.total > data.pagination.limit && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Назад
              </button>
              <span className="text-[#A0AEC0]">
                Страница {filters.page} из {Math.ceil(data.pagination.total / data.pagination.limit)}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={filters.page! >= Math.ceil(data.pagination.total / data.pagination.limit)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ProductCard = ({
  product,
  onAddToCart,
  onClick,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}) => {
  const discount = calculateDiscount(product.price, product.discount_price || 0);
  const finalPrice = product.discount_price || product.price;

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
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-white">₸{finalPrice.toFixed(2)}</span>
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
            showSuccessToast('Товар успешно добавлен в корзину', '')
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

const ProductListItem = ({
  product,
  onAddToCart,
  onClick,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}) => {
  const discount = calculateDiscount(product.price, product.discount_price || 0);
  const finalPrice = product.discount_price || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex gap-4 cursor-pointer group hover:bg-[#1A1F2E] transition-colors"
      onClick={onClick}
    >
      <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-lg">
        <img
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-1 right-1 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{product.title}</h3>
        <p className="text-sm text-[#A0AEC0] mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">₸{finalPrice.toFixed(2)}</span>
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
              showSuccessToast('Товар успешно добавлен в корзину', '')
            }}
            disabled={product.quantity === 0}
            className="px-6 py-2 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.quantity === 0 ? "Нет в наличии" : "В корзину"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CatalogPage;

