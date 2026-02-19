"use client";

import {
  Home,
  Package,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X, // <-- Добавили иконку крестика
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const navItems = [
  { id: "dashboard", label: "Панель управления", icon: Home, href: "/seller/dashboard" },
  { id: "products", label: "Товары", icon: Package, href: "/seller/products" },
  { id: "orders", label: "Заказы", icon: ShoppingBag, href: "/seller/orders" },
  { id: "settings", label: "Настройки", icon: Settings, href: "/seller/settings" },
  { id: "chats", label: "Чаты", icon: MessageCircle, href: "/seller/chats" },
];

export const Sidebar = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen,     // <-- Новый проп: открыто ли на мобилке
  onCloseMobile,    // <-- Новый проп: функция закрытия мобильного меню
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Автоматически закрываем мобильное меню при переходе на другую страницу
  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 1. Темный оверлей для мобильных устройств */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. Сам Сайдбар */}
      <motion.div
        className={`fixed left-0 top-0 h-screen bg-[#1A1F2E]/95 md:bg-[#1A1F2E]/80 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ease-in-out md:transition-none
          /* На мобилках: прячем за экран, если не открыто */
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          /* На десктопе: всегда показываем (сбрасываем transform) */
          md:translate-x-0
        `}
        // Ширина на мобилках фиксированная (260px), на десктопе зависит от collapsed
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full">
          {/* Шапка сайдбара с Логотипом */}
          <div className="p-6 flex items-center justify-between">
            {/* На десктопе скрываем лого, если свернуто. На мобилках показываем всегда. */}
            <div className={`flex items-center gap-3 ${collapsed ? "hidden md:hidden" : "flex"}`}>
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center shadow-lg shadow-[#8B7FFF]/30 shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="tracking-tight font-semibold text-white text-xl">
                MARKETPLACE
              </span>
            </div>

            {/* Заглушка логотипа для свернутого состояния (только десктоп) */}
            <div className={`w-10 h-10 rounded-lg bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] items-center justify-center shadow-lg shadow-[#8B7FFF]/30 mx-auto ${collapsed ? "hidden md:flex" : "hidden"}`}>
              <Package className="w-6 h-6 text-white" />
            </div>

            {/* Кнопка закрытия (крестик) ТОЛЬКО для мобилок */}
            <button 
              onClick={onCloseMobile} 
              className="md:hidden p-2 -mr-2 text-[#A0AEC0] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
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
                  
                  {/* Текст ссылок (скрываем на свернутом десктопе) */}
                  <span className={`text-sm font-medium whitespace-nowrap ${collapsed ? "hidden md:hidden" : "block"}`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>

          {/* Кнопка сворачивания (ТОЛЬКО для десктопа) */}
          <div className="p-3 hidden md:block">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-3 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
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
    </>
  );
};