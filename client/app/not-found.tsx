"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, CornerDownRight } from "lucide-react";

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      
      {/* Элементы фона (Blurry Glows) */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[30%] w-96 h-96 rounded-full bg-[#8B7FFF]/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[30%] w-96 h-96 rounded-full bg-[#6DD5ED]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center flex flex-col items-center"
      >
        {/* Большая анимированная цифра 404 */}
        <motion.h1 
          className="text-[120px] md:text-[160px] font-extrabold leading-none tracking-tight bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] bg-clip-text text-transparent select-none mb-6 relative"
          animate={{
            scale: [1, 1.03, 1],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          404
        </motion.h1>

        {/* Заголовок и описание */}
        <div className="mb-10 max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ой! Эта страница потерялась.
          </h2>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-md mx-auto">
            Кажется, вы забрели не в тот переулок нашего маркетплейса, или эта страница была удалена.
          </p>
        </div>

        {/* Иллюстративная "карточка ошибки" */}
        <motion.div
            initial={{ scale: 0.9, opacity: 0}}
            animate={{ scale: 1, opacity: 1}}
            transition={{ delay: 0.2, duration: 0.5}}
            className="mb-12 p-6 bg-[#1A1F2E]/80 backdrop-blur-sm border border-white/5 rounded-2xl flex items-center gap-5 w-full max-w-sm shadow-xl"
        >
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Search className="w-8 h-8 text-[#A0AEC0]" />
            </div>
            <div className="flex-1 text-left space-y-1">
                <div className="text-xs text-[#A0AEC0] flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Запрос не дал результатов
                </div>
                <div className="font-semibold text-white">Путь не найден</div>
                <div className="text-sm text-[#A0AEC0]">Выход здесь 👇</div>
            </div>
        </motion.div>

        {/* Кнопка действия */}
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-10 py-3.5 rounded-full font-semibold bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] hover:from-[#7A6EEB] hover:to-[#5CC4DC] transition-all shadow-lg shadow-[#8B7FFF]/30 hover:shadow-indigo-500/40"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Вернуться на главную
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default PageNotFound;