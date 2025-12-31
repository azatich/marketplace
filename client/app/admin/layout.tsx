"use client";

import LogoutButton from "@/components/Logout";
import { Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isClientPage = pathname.startsWith("/admin/clients");
  const isSellerPage = pathname.startsWith("/admin/sellers");

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6">
      <div>
        <div>
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl uppercase">Админ панель</h1>
            <LogoutButton />
          </div>
          <div className="bg-[#1A1F2E]/60 backdrop-blur-xl rounded-[12px] border border-white/5 p-2 inline-flex gap-2">
            <Link
              href="/admin/clients"
              className={`${
                isClientPage
                  ? "bg-linear-to-r from-[#8B7FFF]/20 to-[#6DD5ED]/20"
                  : ""
              } relative px-6 py-3 rounded-lg transition-all flex items-center gap-2 text-white`}
            >
              <Users />
              Клиенты
            </Link>
            <Link
              href="/admin/sellers"
              className={`${
                isSellerPage
                  ? "bg-linear-to-r from-[#8B7FFF]/20 to-[#6DD5ED]/20"
                  : ""
              } relative px-6 py-3 rounded-lg transition-all flex items-center gap-2 text-white`}
            >
              <Store />
              Продавцы
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
