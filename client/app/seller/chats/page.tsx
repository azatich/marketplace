"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareDashed, Search, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSellerChats } from "@/features/seller/hooks/useSellerChats";

// Типы для предпросмотра чата
interface ChatPreview {
  id: string;
  client: {
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  lastMessage: {
    text: string;
    created_at: string;
    is_read: boolean;
    sender_id: string; // Чтобы понимать, мы это написали или нам
  } | null;
  unreadCount: number;
}

export default function SellerChatsListPage() {
  const { data: chats = [], isPending } = useSellerChats();

  const [searchQuery, setSearchQuery] = useState("");
  const filteredChats = chats.filter((chat) => {
    const fullName = chat.displayInfo.full_name.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  console.log(filteredChats);
  

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth();

    if (isToday) {
      return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  if (isPending) {
    return (
      <div className="p-20 text-center text-[#A0AEC0]">
        Загрузка диалогов...
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-[#1A1F2E]/50 backdrop-blur-sm"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
            <MessageSquareDashed className="w-12 h-12 text-[#8B7FFF]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет активных диалогов
          </h2>
          <p className="text-[#A0AEC0] max-w-md mb-8 leading-relaxed">
            У вас пока нет сообщений от покупателей. Перейдите в раздел заказов,
            чтобы первыми связаться с клиентами для уточнения деталей доставки.
          </p>
          {/* Кнопка редиректа на заказы */}
          <Link
            href="/seller/orders"
            className="px-8 py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-xl text-white font-bold hover:shadow-lg hover:shadow-[#8B7FFF]/30 transition-all active:scale-95 flex items-center gap-2"
          >
            Связаться с клиентами <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Сообщения</h1>
          <p className="text-[#A0AEC0]">Общение с вашими покупателями</p>
        </div>

        {/* Поиск по чатам */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#1A1F2E] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#8B7FFF]/50 transition-colors"
          />
        </div>
      </div>

      <motion.div
        className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
      >
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#A0AEC0]">
            По вашему запросу ничего не найдено.
          </div>
        ) : (
          filteredChats.map((chat) => {
            const fullName = chat.displayInfo.full_name
            const isUnread = chat.unreadCount > 0;

            return (
              <motion.div
                key={chat.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <Link
                  href={`/seller/chats/${chat.id}`}
                  className="flex items-center gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  {/* Аватар */}
                  {chat.displayInfo.avatar ? (
                    <img src={chat.displayInfo.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-8 h-8 text-[#8B7FFF]" />
                  )}

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`font-semibold truncate pr-4 ${isUnread ? "text-white" : "text-[#e2e8f0]"}`}
                      >
                        {fullName}
                      </h3>
                      {chat.lastMessage && (
                        <span
                          className={`text-xs shrink-0 ${isUnread ? "text-[#8B7FFF] font-medium" : "text-[#A0AEC0]"}`}
                        >
                          {formatTime(chat.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <p
                        className={`text-sm truncate ${isUnread ? "text-white font-medium" : "text-[#A0AEC0]"}`}
                      >
                        {chat.lastMessage?.sender_id === "me" && (
                          <span className="text-[#8B7FFF] mr-1">Вы:</span>
                        )}
                        {chat.lastMessage?.text || "Нет сообщений"}
                      </p>

                      {/* Бейдж непрочитанных */}
                      {isUnread && (
                        <div className="w-5 h-5 rounded-full bg-[#8B7FFF] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
