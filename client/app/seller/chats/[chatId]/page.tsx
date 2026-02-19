"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  User,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSellerProfile } from "@/features/seller";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useSellerChats } from "@/features/seller/hooks/useSellerChats";

export default function SellerChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { chatId } = resolvedParams;

  const { data: profile } = useSellerProfile();
  const currentUserId = profile?.id;

  // 1. Получаем список всех чатов
  const { data: chats = [] } = useSellerChats();

  // 2. Находим текущий чат в списке, чтобы достать данные клиента (имя и аватар)
  const currentChat = chats.find((c) => c.id === chatId);
  const clientInfo = currentChat?.client;

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isCompanionOnline, isLoading, sendMessage } =
    useChatSocket(chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  if (!currentUserId || isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#8B7FFF] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] min-h-[500px] flex flex-col bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. ШАПКА ЧАТА (Продавец видит Клиента) */}
      <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Аватар клиента */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5">
          {clientInfo?.avatar ? (
            <img 
              src={clientInfo.avatar} 
              alt={clientInfo.first_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#6DD5ED]/20">
              <User className="w-5 h-5 text-[#6DD5ED]" />
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold text-white leading-tight">
            {clientInfo ? `${clientInfo.first_name} ${clientInfo.last_name}` : "Загрузка..."}
          </h2>
          <p className="text-xs flex items-center gap-1.5 mt-0.5">
            {isCompanionOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 font-medium">В сети</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#A0AEC0]" />
                <span className="text-[#A0AEC0]">Был(а) недавно</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 2. СПИСОК СООБЩЕНИЙ */}
      {/* ... (Тут твой код без изменений) ... */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0f121b]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const time = new Intl.DateTimeFormat("ru", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(msg.created_at));

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[65%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base shadow-sm ${
                  isMine
                    ? "bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] text-white rounded-tr-sm"
                    : "bg-[#1A1F2E] text-[#e2e8f0] border border-white/5 rounded-tl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? "justify-end text-white/80" : "justify-start text-[#A0AEC0]"}`}
                >
                  <span>{time}</span>
                  {isMine &&
                    (msg.is_read ? (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                    ) : (
                      <Check className="w-3 h-3 text-white/70" />
                    ))}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. ИНПУТ ВВОДА */}
      {/* ... (Твой код без изменений) ... */}
      <form
        onSubmit={handleSend}
        className="p-4 sm:p-6 bg-[#1A1F2E] border-t border-white/5"
      >
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#8B7FFF]/50 focus-within:bg-white/10 transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              placeholder="Написать покупателю... (Enter для отправки)"
              className="w-full max-h-32 px-4 py-3 sm:py-4 bg-transparent text-white placeholder:text-[#A0AEC0] resize-none outline-none text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#8B7FFF] flex items-center justify-center text-white shrink-0 hover:bg-[#7a6ee6] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}