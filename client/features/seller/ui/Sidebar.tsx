"use client";

import {
  Home,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    id: "dashboard",
    label: "Панель управления",
    icon: Home,
    href: "/seller/dashboard",
  },
  {
    id: "products",
    label: "Товары",
    icon: Package,
    href: "/seller/products",
  },
  {
    id: "orders",
    label: "Заказы",
    icon: ShoppingBag,
    href: "/seller/orders",
  },
  {
    id: "settings",
    label: "Настройки",
    icon: Settings,
    href: "/seller/settings",
  },
  {
    id: "chats",
    label: "Чаты",
    icon: MessageCircle,
    href: "/seller/chats",
  },
];
export const Sidebar = ({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen bg-[#1A1F2E]/80 backdrop-blur-xl border-r border-white/5 z-50"
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center shadow-lg shadow-[#8B7FFF]/30">
                <Package className="w-6 h-6" />
              </div>
              <span className="tracking-tight font-semibold text-white text-xl ">
                MARKETPLACE
              </span>
            </motion.div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center shadow-lg shadow-[#8B7FFF]/30 mx-auto">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                  active
                    ? "bg-linear-to-r from-[#8B7FFF]/20 to-[#6DD5ED]/20 text-white"
                    : "text-[#A0AEC0] hover:text-white hover:bg-white/5"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#8B7FFF] to-[#6DD5ED] rounded-r"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-3 rounded-lg text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
