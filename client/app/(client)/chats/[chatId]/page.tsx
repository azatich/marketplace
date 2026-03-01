"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Store,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClientProfile } from "@/features/client/hooks/useClientProfile";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useSellerChats } from "@/features/seller/hooks/useSellerChats";

export default function ClientChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const router = useRouter();

  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;

  const { data: profile } = useClientProfile();
  const currentUserId = profile?.id;

  const { data: chats = [] } = useSellerChats();
  const currentChat = chats.find((c) => c.id === chatId);
  const displayInfo = currentChat?.displayInfo;

  const {
    messages,
    isCompanionOnline,
    isLoading,
    sendMessage,
    markAsRead,
    sendTypingStatus,
    isCompanionTyping,
  } = useChatSocket(chatId);

  const [inputValue, setInputValue] = useState("");

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Скролл вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unread = messages.filter(
      (m) => m.sender_id !== currentUserId && !m.is_read,
    );
    unread.forEach((m) => markAsRead(m.id));
  }, [messages, currentUserId, markAsRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
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
      {/* 1. ШАПКА ЧАТА (Данные магазина) */}
      <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-white/5 bg-white/2">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#8B7FFF]/30 bg-[#8B7FFF]/10 flex items-center justify-center">
          {displayInfo?.avatar_url ? (
            <img
              src={displayInfo.avatar_url}
              alt="Store"
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="w-5 h-5 text-[#8B7FFF]" />
          )}
        </div>

        <div>
          <h2 className="font-bold text-white leading-tight">
            {displayInfo?.full_name || "Загрузка..."}
          </h2>
          <div className="text-xs mt-0.5 h-4 flex items-center">
            {isCompanionTyping ? (
              <div className="flex items-center gap-1">
                <span className="text-[#8B7FFF] font-medium italic">
                  печатает
                </span>
                <div className="flex gap-1">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-1 h-1 bg-[#8B7FFF] rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1 h-1 bg-[#8B7FFF] rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1 h-1 bg-[#8B7FFF] rounded-full"
                  />
                </div>
              </div>
            ) : isCompanionOnline ? (
              <span className="text-green-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />В сети
              </span>
            ) : (
              <span className="text-[#A0AEC0]">Был(а) недавно</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. СПИСОК СООБЩЕНИЙ */}
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
                className={`max-w-[80%] sm:max-w-[65%] px-5 py-3 rounded-2xl text-sm sm:text-base shadow-sm ${
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
                      <CheckCheck className="w-3.5 h-3.5 text-white" />
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
      <form
        onSubmit={handleSend}
        className="p-4 sm:p-6 bg-[#1A1F2E] border-t border-white/5"
      >
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#8B7FFF]/50 focus-within:bg-white/10 transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              placeholder="Напишите сообщение..."
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
