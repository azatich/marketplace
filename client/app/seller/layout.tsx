"use client";

import { Header, Sidebar } from "@/features/seller";
import { useState, useCallback } from "react"; // Добавь useCallback

function SellerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Используем useCallback, чтобы ссылка на функцию не менялась
  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={handleCloseMobile} // Передаем стабильную функцию
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />
      
      <div 
        className={`flex-1 transition-all duration-300 flex flex-col ${collapsed ? "md:ml-20" : "md:ml-[240px]"}`}
      >
        <Header onOpenMobile={handleOpenMobile} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default SellerLayout;