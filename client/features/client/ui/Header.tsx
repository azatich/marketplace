"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  Package,
  MessageSquare,
  LayoutGrid,
  User as UserIcon,
} from "lucide-react";
import LogoutButton from "@/components/Logout";
import { useClientProfile } from "../hooks/useClientProfile";

const CartBadge = dynamic(
  () => import("../ui/CartBadge").then((mod) => mod.CartBadge),
  {
    ssr: false,
    loading: () => <div className="w-5 h-5" />,
  },
);

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: profileData, isLoading } = useClientProfile();

  const customer = profileData?.customers?.[0];
  const avatarUrl = customer?.avatar_url;
  const username = customer?.username || profileData?.email || "Пользователь";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/catalog", label: "Каталог", icon: LayoutGrid },
    { href: "/cart", label: "Корзина", icon: ShoppingCart, hasBadge: true },
    { href: "/orders", label: "Заказы", icon: Package },
    { href: "/chats", label: "Чаты", icon: MessageSquare },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          {/* 1. Левая часть: Бургер (мобилки) + Логотип */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-[#A0AEC0] hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href="/catalog"
              className="flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-bold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent"
            >
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center shadow-lg shadow-[#8B7FFF]/30 shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              YouMarket
            </Link>
          </div>

          {/* 2. Центр: Навигация (Только десктоп) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
              >
                {link.label}
                {link.hasBadge && <CartBadge />}
              </Link>
            ))}
          </nav>

          {/* 3. Правая часть: Профиль + Выход */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Иконка корзины для мобилок (быстрый доступ) */}
            <Link
              href="/cart"
              className="md:hidden relative p-2 text-[#A0AEC0]"
            >
              <ShoppingCart className="w-6 h-6" />
              <CartBadge />
            </Link>

            {!isLoading && profileData && (
              <Link
                href="/profile"
                className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/10 hover:border-[#8B7FFF] transition-all"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2D3748] flex items-center justify-center">
                    <span className="text-white font-semibold">{initial}</span>
                  </div>
                )}
              </Link>
            )}

            <div className="hidden sm:block">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* 4. Мобильное меню (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Затемнение фона */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Панель меню */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#1A1F2E] border-r border-white/10 z-[70] md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <span className="font-bold text-white">Меню</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#A0AEC0]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        pathname === link.href
                          ? "bg-[#8B7FFF]/10 text-[#8B7FFF]"
                          : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                      {link.hasBadge && (
                        <div className="ml-auto scale-110 origin-right">
                          <CartBadge />
                        </div>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-white/5">
                  <Link
                    href="/profile"
                    className="flex items-center gap-4 px-4 py-3 text-[#A0AEC0] hover:text-white transition-all"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="font-medium">Мой профиль</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 border-t border-white/5">
                <LogoutButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
