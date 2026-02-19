"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface TopProduct {
  id: string;
  name: string;
  image: string | null;
  sales: number;
  revenue: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  topProducts: TopProduct[];
  chartData: {
    Day: ChartDataPoint[];
    Week: ChartDataPoint[];
    Month: ChartDataPoint[];
    Year: ChartDataPoint[];
  };
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await api.get("/seller/dashboard-stats");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};