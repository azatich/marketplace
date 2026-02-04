"use client";

import { Header } from "@/features/client";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <Header />
      <main>{children}</main>
    </div>
  );
}

