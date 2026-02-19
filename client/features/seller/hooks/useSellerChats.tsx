"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Экспортируем интерфейс, чтобы использовать его в UI компоненте
export interface ChatPreview {
  id: string;
  displayInfo: {
    full_name: string,
    avatar_url: string | null,
  },
  lastMessage: {
    text: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  } | null;
  unreadCount: number;
}

export const useSellerChats = () => {
  return useQuery<ChatPreview[]>({
    queryKey: ["sellerChats"], // Ключ для кеширования
    queryFn: async () => {
      const res = await api.get("/chats");
      return res.data;
    },
    // Настройки свежести данных
    staleTime: 1000 * 30, // Считаем данные свежими 30 секунд
    refetchInterval: 1000 * 15, // АВТО-ОБНОВЛЕНИЕ: Запрашиваем список каждые 15 сек (чтобы новые сообщения появлялись в фоне)
    refetchOnWindowFocus: true, // Обновляем при возвращении на вкладку
  });
};