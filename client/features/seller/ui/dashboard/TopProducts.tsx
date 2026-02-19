"use client";

import { motion } from 'framer-motion';
import { TrendingUp, PackageSearch, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const TopProducts = () => {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-[#1A1F2E]/80 border border-white/5 h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8B7FFF] animate-spin" />
      </div>
    );
  }

  const products = data?.topProducts || [];
  
  // Ищем максимальное количество продаж для шкалы (защита от деления на 0)
  const maxSales = products.length > 0 ? Math.max(...products.map(p => p.sales)) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-1">Топ товары</h3>
          <p className="text-sm text-[#A0AEC0]">По уровню дохода</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#2D3748] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#6DD5ED]" />
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 justify-center">
        {products.length === 0 ? (
          <div className="text-center text-[#A0AEC0] py-10 flex flex-col items-center gap-3">
            <PackageSearch className="w-12 h-12 opacity-50" />
            <p>У вас еще нет проданных товаров</p>
          </div>
        ) : (
          products.map((product) => {
            const progressWidth = (product.sales / maxSales) * 100;

            return (
              <div key={product.id} className="relative">
                <div className="flex items-center justify-between mb-2 z-10 relative">
                  <div className="flex items-center gap-4">
                    {/* Реальная картинка товара */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                      <img 
                        src={product.image || '/placeholder.jpg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-white truncate max-w-[150px] sm:max-w-[200px]">
                        {product.name}
                      </h4>
                      <p className="text-sm text-[#A0AEC0]">{product.sales} продаж</p>
                    </div>
                  </div>
                  <p className="font-semibold text-[#6DD5ED]">
                    ₸{product.revenue.toLocaleString('ru-RU')}
                  </p>
                </div>
                
                {/* Прогресс-бар */}
                <div className="h-1.5 w-full bg-[#131722] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressWidth}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default TopProducts;