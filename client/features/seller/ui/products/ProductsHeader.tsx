"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export const ProductsHeader = () => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl mb-2">Ваши продукты</h1>
        <p className="text-[#A0AEC0]">Управляйте своим каталогом товаров</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push("/seller/products/add")}
        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg shadow-lg shadow-[#8B7FFF]/30 hover:shadow-[#8B7FFF]/50 transition-all"
      >
        <Plus className="w-5 h-5" />
        Добавить продукт
      </motion.button>
    </div>
  );
};
