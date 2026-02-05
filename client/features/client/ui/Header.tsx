"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import LogoutButton from "@/components/Logout";
import { useClientProfile } from "../hooks/useClientProfile";

const CartBadge = dynamic(() => import('../ui/CartBadge').then((mod) => mod.CartBadge), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
})

export const Header = () => {
  const pathname = usePathname();
  const { data: profileData, isLoading } = useClientProfile();

  const customer = profileData?.customers?.[0];
  const avatarUrl = customer?.avatar_url;
  
  const username = customer?.username || profileData?.email || "?";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/catalog"
            className="text-2xl font-bold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent"
          >
            Marketplace
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/catalog"
              className={`text-sm transition-colors ${
                pathname === "/catalog"
                  ? "text-white"
                  : "text-[#A0AEC0] hover:text-white"
              }`}
            >
              Каталог
            </Link>
            <Link
              href="/cart"
              className={`relative text-sm ${
                pathname === "/cart"
                  ? "text-white"
                  : "text-[#A0AEC0] hover:text-white"
              } `}
            >
              Корзина
              <CartBadge />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Аватар пользователя */}
            {!isLoading && profileData && (
              <Link 
                href="/profile" 
                className="group relative w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-[#8B7FFF] transition-all duration-300"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2D3748] group-hover:bg-[#3A4A63] flex items-center justify-center transition-colors">
                    <span className="text-white font-semibold text-lg">
                      {initial}
                    </span>
                  </div>
                )}
              </Link>
            )}

            {/* Если данные еще грузятся, можно показать скелетон */}
            {isLoading && (
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            )}

            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
};