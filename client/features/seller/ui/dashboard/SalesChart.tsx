"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const tabs = ["Day", "Week", "Month", "Year"] as const;
type TabType = (typeof tabs)[number];

const SalesChart = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Week");

  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-[#1A1F2E]/80 border border-white/5 h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8B7FFF] animate-spin" />
      </div>
    );
  }

  // Забираем данные для выбранной вкладки (если данных нет, ставим пустой массив)
  const chartData = data?.chartData[activeTab] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 h-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">Обзор продаж</h3>
          <p className="text-sm text-[#A0AEC0]">Динамика дохода (₸)</p>
        </div>
        <div className="flex bg-[#131722] p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                activeTab === tab
                  ? "bg-[#2D3748] text-white shadow-sm"
                  : "text-[#A0AEC0] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-[#A0AEC0]">
            Нет данных за этот период
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B7FFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B7FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ffffff10"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A0AEC0", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A0AEC0", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1F2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "#ffffff20" }}
                formatter={(value: number | undefined) => [
                  `₸ ${(value || 0).toLocaleString("ru-RU")}`,
                  "Доход",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B7FFF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default SalesChart;
