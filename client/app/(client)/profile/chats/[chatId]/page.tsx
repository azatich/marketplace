"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Store, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClientProfile } from "@/features/client/hooks/useClientProfile";
// import { useChatSocket } from "@/features/chat/hooks/useChatSocket";

// Заглушка типа сообщения
interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const router = useRouter();
  const { data: profile } = useClientProfile();
  const currentUserId = profile?.id; // Твой ID из профиля
  
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ЗАГЛУШКА ХУКА СОКЕТОВ (раскомментируй, когда бэкенд будет готов)
  // const { messages, sendMessage } = useChatSocket(params.chatId);
  
  // --- Временные фейковые данные для дизайна ---
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender_id: "seller-123", text: "Здравствуйте! Ваш заказ уже собирается.", created_at: new Date().toISOString() },
    { id: "2", sender_id: currentUserId || "me", text: "Спасибо! А когда примерно отправите?", created_at: new Date().toISOString() },
  ]);
  const sendMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender_id: currentUserId || "me", text, created_at: new Date().toISOString() }]);
  };
  // ----------------------------------------------

  // Автоматический скролл вниз при добавлении новых сообщений
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

  if (!currentUserId) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#8B7FFF] w-8 h-8" /></div>;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] min-h-[500px] flex flex-col bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* 1. ШАПКА ЧАТА */}
      <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-white/5 bg-white/[0.02]">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-[#8B7FFF]/20 flex items-center justify-center shrink-0 border border-[#8B7FFF]/30">
          <Store className="w-5 h-5 text-[#8B7FFF]" />
        </div>
        <div>
          <h2 className="font-bold text-white leading-tight">Продавец (Магазин)</h2>
          <p className="text-xs text-[#A0AEC0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Онлайн
          </p>
        </div>
      </div>

      {/* 2. СПИСОК СООБЩЕНИЙ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0f121b]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const time = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(new Date(msg.created_at));

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
                    ? "bg-linear-to-br from-[#8B7FFF] to-[#6DD5ED] text-white rounded-tr-sm" // Пузырь клиента (голубо-фиолетовый)
                    : "bg-[#1A1F2E] text-[#e2e8f0] border border-white/5 rounded-tl-sm"    // Пузырь продавца (темный)
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#A0AEC0] mt-1.5 px-1">{time}</span>
            </motion.div>
          );
        })}
        {/* Невидимый элемент для автоскролла */}
        <div ref={messagesEndRef} /> 
      </div>

      {/* 3. ИНПУТ ВВОДА */}
      <form onSubmit={handleSend} className="p-4 sm:p-6 bg-[#1A1F2E] border-t border-white/5">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#8B7FFF]/50 focus-within:bg-white/10 transition-colors">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              placeholder="Введите сообщение... (Enter для отправки)"
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