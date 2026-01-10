"use client";

import { Header, Sidebar } from "@/features/seller";
import { useState } from "react";

function SellerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? '80px' : '240px' }}
      >
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default SellerLayout;