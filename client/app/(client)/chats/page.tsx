"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Store, ChevronRight, MessageSquareOff } from "lucide-react";
import Link from "next/link";
import { useSellerChats, ChatPreview } from "@/features/seller/hooks/useSellerChats";

export default function ClientChatsListPage() {
  const { data: chats = [], isLoading } = useSellerChats();

  console.log(chats);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(chat => {
    const storeName = chat.displayInfo.full_name; 
    return storeName.includes(searchQuery.toLowerCase());
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
    }
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7FFF]"></div>
      </div>
    );
  }

  // Пустое состояние
  if (chats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 bg-[#1A1F2E]/50 rounded-3xl border border-dashed border-white/10"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquareOff className="w-10 h-10 text-[#A0AEC0]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">У вас еще нет диалогов</h2>
          <p className="text-[#A0AEC0] mb-8">Свяжитесь с продавцом со страницы товара или из списка ваших заказов.</p>
          <Link href="/orders" className="px-6 py-3 bg-[#8B7FFF] text-white rounded-xl font-semibold hover:bg-[#7a6ee6] transition-all">
            Перейти к заказам
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Мои сообщения</h1>
          <p className="text-[#A0AEC0] mt-1">История переписки с магазинами</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder="Поиск магазина..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#8B7FFF]/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredChats.map((chat) => {
          const isUnread = chat.unreadCount > 0;
          return (
            <motion.div
              key={chat.id}
              whileHover={{ x: 4 }}
              className="relative group"
            >
              <Link 
                href={`/chats/${chat.id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isUnread 
                    ? "bg-white/4 border-[#8B7FFF]/30 shadow-lg shadow-[#8B7FFF]/5" 
                    : "bg-[#1A1F2E]/80 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Аватар магазина */}
                {chat.displayInfo.avatar_url ? (
                  <img
                    src={chat.displayInfo.avatar_url}
                    alt="Store"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Store className="w-10 h-10 text-[#8B7FFF]" />
                )}

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold truncate ${isUnread ? "text-white" : "text-[#E2E8F0]"}`}>
                      {chat.displayInfo.full_name}
                    </h3>
                    <span className="text-xs text-[#A0AEC0] shrink-0 ml-2">
                      {chat.lastMessage ? formatTime(chat.lastMessage.created_at) : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${isUnread ? "text-white font-medium" : "text-[#A0AEC0]"}`}>
                      {chat.lastMessage?.sender_id !== chat.id && <span className="text-[#8B7FFF]">Вы: </span>}
                      {chat.lastMessage?.text || "Начните диалог..."}
                    </p>
                    
                    {isUnread && (
                      <span className="bg-[#8B7FFF] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/30 transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}