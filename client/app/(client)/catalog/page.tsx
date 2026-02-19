"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid, List, Filter, X, Loader2 } from "lucide-react";
import {
  Product,
  ProductCategories,
  ProductFilters,
} from "@/features/client/types";
import { useRouter } from "next/navigation";
import { ProductCard, useCartStore } from "@/features/client";
import { ProductListItem } from "@/features/client/ui/ProductListItem";
import { useProductsInfinite } from "@/features/client/hooks/useInfiniteScroll";
import { useInView } from "react-intersection-observer";

const CatalogPage = () => {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useProductsInfinite(filters);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search })); // page сбросится автоматически хуком
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (
    sortBy: "price" | "created_at" | "discount",
    order: "asc" | "desc",
  ) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: order }));
  };

  const clearFilters = () => {
    setFilters({}); // Полный сброс фильтров
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  if (status === "error") {
    return (
      <div className="text-red-500 text-center py-20">
        Ошибка загрузки товаров
      </div>
    );
  }

  // Вспомогательная функция, чтобы не писать двойной map дважды
  const renderProducts = (mode: "grid" | "list") => {
    return data?.pages.map((page, pageIndex) => (
      <React.Fragment key={pageIndex}>
        {/* 2. ИСПРАВЛЕНИЕ: Итерируемся по массиву products внутри каждой страницы */}
        {page.products.map((product: Product) =>
          mode === "grid" ? (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          ) : (
            // 3. ИСПРАВЛЕНИЕ: Убрана опечатка 'a('
            <ProductListItem
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          ),
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
            {showFilters && <X className="w-4 h-4 ml-2" />}
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
              <option
                className="bg-[#1A1F2E] text-white"
                value="created_at-desc"
              >
                По новизне (новые)
              </option>
              <option
                className="bg-[#1A1F2E] text-white"
                value="created_at-asc"
              >
                По новизне (старые)
              </option>
              <option className="bg-[#1A1F2E] text-white" value="price-asc">
                По цене (возрастание)
              </option>
              <option className="bg-[#1A1F2E] text-white" value="price-desc">
                По цене (убывание)
              </option>
              <option className="bg-[#1A1F2E] text-white" value="discount-desc">
                По размеру скидки
              </option>
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
                onChange={(e) =>
                  handleFilterChange("category", e.target.value || undefined)
                }
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
              >
                <option className="bg-[#1A1F2E]" value="">
                  Все категории
                </option>
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
                  onChange={(e) =>
                    handleFilterChange(
                      "subcategory",
                      e.target.value || undefined,
                    )
                  }
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50"
                >
                  <option value="">Все подкатегории</option>
                  {Object.entries(
                    ProductCategories[
                      filters.category as keyof typeof ProductCategories
                    ]?.children || {},
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
                  handleFilterChange(
                    "minPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
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
                  handleFilterChange(
                    "maxPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
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
              onChange={(e) =>
                handleFilterChange("hasDiscount", e.target.checked || undefined)
              }
              className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#8B7FFF] focus:ring-[#8B7FFF]/50"
            />
            <label
              htmlFor="hasDiscount"
              className="text-sm text-[#A0AEC0] cursor-pointer"
            >
              Только товары со скидкой
            </label>
          </div>
        </motion.div>
      )}
      {status === "pending" ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B7FFF] mb-4" />
          <div className="text-[#A0AEC0]">Загрузка каталога...</div>
        </div>
      ) : data?.pages[0]?.products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#A0AEC0] text-lg">
            По вашему запросу товары не найдены
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-[#8B7FFF] hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {renderProducts("grid")}
            </div>
          ) : (
            <div className="space-y-4">{renderProducts("list")}</div>
          )}

          <div
            ref={ref}
            className="w-full h-24 flex items-center justify-center mt-8"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-8 h-8 animate-spin text-[#8B7FFF]" />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogPage;
