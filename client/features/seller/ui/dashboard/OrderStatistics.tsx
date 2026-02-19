"use client";

import { StatsCard } from "./StatsCard";
import { DollarSign, ShoppingBag, Package, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const OrderStatistics = () => {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl bg-[#1A1F2E]/80 border border-white/5 h-[104px] animate-pulse flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="h-8 w-32 bg-white/10 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard 
        title='Общий доход' 
        value={`₸ ${(data?.totalRevenue || 0).toLocaleString('ru-RU')}`} 
        icon={DollarSign} 
        iconColor='#4ECDC4' 
      />
      <StatsCard 
        title='Количество заказов' 
        value={(data?.totalOrders || 0).toString()} 
        icon={ShoppingBag} 
        iconColor='#8B7FFF' 
      />
      <StatsCard 
        title='Мои товары' 
        value={(data?.totalProducts || 0).toString()} 
        icon={Package} 
        iconColor='#6DD5ED' 
      /> 
    </div>
  );
};

export default OrderStatistics;