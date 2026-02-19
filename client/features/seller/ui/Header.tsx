'use client'

import { Search, Bell, ChevronDown, User, Menu } from "lucide-react"; // Добавили Menu
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/seller/ui/auth";
import { useSellerProfile } from "../hooks/useSellerProfile";

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const logout = useLogout();
  const router = useRouter();
  const { data: profile } = useSellerProfile();

  const storeName = profile?.sellers?.storeName || "Магазин";
  const avatarUrl = profile?.sellers?.avatarUrl;
  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  return (
    <header className="h-20 border-b border-white/5 bg-[#1A1F2E]/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Левая часть: Гамбургер (только мобилки) + Поиск */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          {/* Кнопка открытия бокового меню */}
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg bg-white/5 text-[#A0AEC0] hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar - на совсем маленьких экранах скрываем текст, оставляем иконку или прячем целиком */}
          {/* <div className="relative flex-1 hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full h-11 pl-12 pr-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
            />
          </div> */}
          
          {/* Иконка поиска для мобилок (если инпут скрыт) */}
          {/* <button className="sm:hidden p-2 text-[#A0AEC0]">
            <Search className="w-6 h-6" />
          </button> */}
        </div>

        {/* Правая часть Section */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Store Name - скрываем на мобилках */}
          <div className="text-sm text-[#A0AEC0] hidden md:block">
            <span className="text-white font-medium">{storeName}</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-white">{initials}</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-[#A0AEC0] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {showUserMenu && (
              <>
                {/* Невидимая подложка для закрытия при клике мимо */}
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1A1F2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/seller/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Настройки
                    </button>
                    <div className="border-t border-white/10 my-2" />
                    <button
                      disabled={logout.isPending}
                      onClick={() => logout.mutate()}
                      className="w-full px-4 py-2 text-left text-sm text-[#FF6B6B] hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}