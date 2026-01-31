"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/Logout";
import dynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";

const CartBadge = dynamic(() => import('../../features/client/ui/CartBadge'), {
  ssr: false,
  loading: () => <div className="w-5 h-5" />
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent">
              Marketplace
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/home"
                className={`text-sm transition-colors ${
                  pathname === "/home"
                    ? "text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
              >
                Каталог
              </Link>
              <Link
                href="/cart"
                className="relative"
              >
                <ShoppingCart />
                <CartBadge />
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

