'use client'

import { Search, Bell, ChevronDown, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/auth";
import { useSellerProfile } from "../hooks/useSellerProfile";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
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
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="Поиск товаров, заказов, клиентов..."
              className="w-full h-11 pl-12 pr-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Store Name */}
          <div className="text-sm text-[#A0AEC0] hidden lg:block">
            <span className="text-white">{storeName}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Bell className="w-5 h-5 text-[#A0AEC0]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full ring-2 ring-[#1A1F2E]" />
            </motion.button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#1A1F2E]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    {
                      id: 1,
                      text: "New order #1234 received",
                      time: "2 min ago",
                      unread: true,
                    },
                    {
                      id: 2,
                      text: 'Product "Wireless Headphones" is low on stock',
                      time: "1 hour ago",
                      unread: true,
                    },
                    {
                      id: 3,
                      text: "Order #1233 has been shipped",
                      time: "3 hours ago",
                      unread: false,
                    },
                  ].map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        notification.unread ? "bg-white/5" : ""
                      }`}
                    >
                      <p className="text-sm">{notification.text}</p>
                      <p className="text-xs text-[#A0AEC0] mt-1">
                        {notification.time}j
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linearw-to-br from-[#8B7FFF] to-[#6DD5ED] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">{initials}</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-[#A0AEC0]" />
            </motion.button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#1A1F2E]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
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
                    Выйти из системы
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
