"use client";

import { StatsCard } from "./StatsCard";
import {DollarSign, ShoppingBag, Package} from 'lucide-react'

const OrderStatistics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard title='Общий доход' value='10000' icon={DollarSign} iconColor='#4ECDC4' />
      <StatsCard title='Общая сумма заказов' value='32' icon={ShoppingBag} iconColor='#8B7FFF' />
      <StatsCard title='Количество товаров' value='12' icon={Package} iconColor='#6DD5ED' /> 
    </div>
  );
};

export default OrderStatistics;
