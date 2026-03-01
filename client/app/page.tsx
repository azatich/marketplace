"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Store, ShieldCheck, Zap, Globe, LayoutDashboard, Settings } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=600&auto=format&fit=crop",
];

// Типизируем payload токена для TypeScript
interface CustomJwtPayload {
  userId: string;
  role: "client" | "seller" | "admin";
}

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "seller" | "admin" | null>(null);

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get("token");
    
    if (token) {
      try {
        // Расшифровываем токен, чтобы узнать роль
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Ошибка расшифровки токена:", error);
        Cookies.remove("token"); // Если токен сломан, удаляем его
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1419] text-white overflow-hidden selection:bg-[#8B7FFF]/30">
      
      {/* 1. ХЕДЕР */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent">
          <ShoppingBag className="w-8 h-8 text-[#8B7FFF]" />
          YouMarket
        </div>
        
        <div className="flex items-center gap-4">
          {!mounted ? (
            <div className="w-24 h-10 bg-white/5 rounded-xl animate-pulse" />
          ) : userRole === "client" ? (
            <Link 
              href="/catalog" 
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Каталог
            </Link>
          ) : userRole === "seller" ? (
            <Link 
              href="/seller/dashboard" 
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Магазин
            </Link>
          ) : userRole === "admin" ? (
            <Link 
              href="/admin/clients" 
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#8B7FFF]/20 hover:bg-[#8B7FFF]/30 text-[#8B7FFF] border border-[#8B7FFF]/30 transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Панель управления
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="hidden sm:block text-sm font-medium text-[#A0AEC0] hover:text-white transition-colors"
              >
                Войти
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. ГЛАВНЫЙ БЛОК */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#8B7FFF]/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#6DD5ED]/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#6DD5ED] text-sm font-medium mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6DD5ED] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6DD5ED]"></span>
            </span>
            Платформа нового поколения
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Покупай и продавай <br className="hidden md:block" />
            с <span className="bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent">максимальным</span> комфортом
          </h1>
          
          <p className="text-lg md:text-xl text-[#A0AEC0] mb-12 max-w-2xl mx-auto leading-relaxed">
            YouMarket — это современная площадка, где продавцы находят своих идеальных клиентов, а покупатели наслаждаются огромным выбором и безопасными сделками.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 min-h-[60px]">
            {!mounted ? (
               <div className="w-full sm:w-[200px] h-14 bg-white/5 rounded-2xl animate-pulse" />
            ) : userRole === "client" ? (
              <Link 
                href="/catalog"
                className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-2xl font-bold text-white shadow-lg shadow-[#8B7FFF]/25 hover:shadow-[#8B7FFF]/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Вернуться к покупкам
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : userRole === "seller" ? (
              <Link 
                href="/seller/dashboard"
                className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1F2E] border border-[#8B7FFF]/50 hover:bg-[#8B7FFF]/10 rounded-2xl font-bold text-white shadow-lg shadow-[#8B7FFF]/10 transition-all duration-300"
              >
                <Store className="w-5 h-5 text-[#8B7FFF]" />
                Управление магазином
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : userRole === "admin" ? (
               <Link 
                href="/admin/clients"
                className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-8 py-4 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 rounded-2xl font-bold text-white transition-all duration-300"
              >
                <Settings className="w-5 h-5 text-red-400" />
                Панель Администратора
              </Link>
            ) : (
              <>
                <Link 
                  href="/signup"
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-2xl font-bold text-white shadow-lg shadow-[#8B7FFF]/25 hover:shadow-[#8B7FFF]/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Начать покупки
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/signup-seller"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1F2E] border border-white/10 hover:border-[#8B7FFF]/50 hover:bg-white/5 rounded-2xl font-semibold text-white transition-all duration-300"
                >
                  <Store className="w-5 h-5 text-[#A0AEC0]" />
                  Стать продавцом
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* 3. КАРУСЕЛЬ */}
      <section className="relative py-10 w-full overflow-hidden flex items-center bg-white/[0.02] border-y border-white/5">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-linear-to-r from-[#0F1419] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-linear-to-l from-[#0F1419] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 sm:gap-6 w-max pointer-events-none">
          <motion.div
            className="flex gap-4 sm:gap-6"
            animate={{ x: [0, -1032] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          >
            {[...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES].map((src, idx) => (
              <div 
                key={idx} 
                className="relative w-[200px] h-[250px] sm:w-[280px] sm:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 border border-white/10 group"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src={src} alt="Item" className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. ПРЕИМУЩЕСТВА */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { icon: <Zap className="w-8 h-8 text-[#6DD5ED]" />, title: "Молниеносно", desc: "Быстрый поиск и удобный чат с продавцами в реальном времени." },
          { icon: <ShieldCheck className="w-8 h-8 text-[#8B7FFF]" />, title: "Безопасно", desc: "Строгая верификация продавцов." },
          { icon: <Globe className="w-8 h-8 text-[#A0AEC0]" />, title: "Глобально", desc: "Тысячи товаров со всего мира собраны в одном удобном каталоге." },
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1A1F2E] flex items-center justify-center mb-6 shadow-inner">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-[#A0AEC0] leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

    </div>
  );
}