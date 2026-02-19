import { Request, Response } from "express";
import { supabase } from "../server";
import { JWTUtils } from "../utils/jwt";
import { UserRole } from "../types";

export class ChatController {
  static async getOrCreateChat(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (
        !payload ||
        (payload.role !== UserRole.CLIENT && payload.role !== UserRole.SELLER)
      ) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      let clientId: string;
      let sellerId: string;

      if (payload.role === UserRole.CLIENT) {
        clientId = payload.userId;
        sellerId = req.body.sellerId;

        if (!sellerId) {
          return res.status(400).json({ message: "Не указан sellerId" });
        }
      } else {
        // Запрос пришел от продавца
        sellerId = payload.userId;
        clientId = req.body.clientId;

        if (!clientId) {
          return res.status(400).json({ message: "Не указан clientId" });
        }
      }

      // 1. Ищем чат по обоим ID
      let { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("id")
        .eq("client_id", clientId)
        .eq("seller_id", sellerId)
        .maybeSingle();

      if (chatError) {
        return res.status(500).json({
          success: false,
          message: chatError.message,
        });
      }

      // 2. Если не нашли — создаем
      if (!chat) {
        const { data: newChat, error: newChatError } = await supabase
          .from("chats")
          .insert({ client_id: clientId, seller_id: sellerId })
          .select("id")
          .single();

        if (newChatError) {
          return res.status(500).json({
            success: false,
            message: newChatError.message,
          });
        }

        chat = newChat;
      }

      return res.status(200).json({ chatId: chat.id });
    } catch (error) {
      console.error("Chat Error:", error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getChatMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const token = req.cookies.token;

      if (!token) return res.status(401).json({ message: "Неавторизован" });
      const payload = await JWTUtils.verify(token);
      if (!payload) return res.status(401).json({ message: "Неавторизован" });

      // 1. Проверяем, имеет ли юзер доступ к этому чату
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("client_id, seller_id")
        .eq("id", chatId)
        .single();

      if (chatError || !chat) {
        return res.status(404).json({ message: "Чат не найден" });
      }

      // Если это не клиент этого чата и не продавец этого чата - блочим
      if (
        payload.userId !== chat.client_id &&
        payload.userId !== chat.seller_id
      ) {
        return res.status(403).json({ message: "Чужой чат" });
      }

      // 2. Достаем сообщения, сортируем от старых к новым (чтобы читать сверху вниз)
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      // 3. Узнаем ID собеседника (нужно для фронтенда)
      const companionId =
        payload.userId === chat.client_id ? chat.seller_id : chat.client_id;

      return res.status(200).json({
        messages: messages || [],
        companionId,
      });
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getMyChats(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "Неавторизован" });

      const payload = await JWTUtils.verify(token);
      if (!payload) return res.status(401).json({ message: "Неавторизован" });

      const userId = payload.userId;
      const role = payload.role; // 'client' или 'seller'

      // 1. Ищем чаты в зависимости от роли
      let chatQuery = supabase.from("chats").select(`
        id,
        client_id,
        seller_id,
        users!chats_client_id_fkey(
          first_name,
          last_name,
          customers(avatar_url)
        ),
        sellers!chats_seller_id_fkey(storeName, avatarUrl)
      `);

      if (role === UserRole.SELLER) {
        chatQuery = chatQuery.eq("seller_id", userId);
      } else {
        chatQuery = chatQuery.eq("client_id", userId);
      }

      const { data: chats, error: chatsError } = await chatQuery;

      if (chatsError) throw chatsError;
      if (!chats || chats.length === 0) return res.status(200).json([]);

      // 2. Достаем последние сообщения и считаем непрочитанные
      // Используем Promise.all для параллельного выполнения запросов
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          // А) Получаем только ОДНО самое свежее сообщение
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("text, created_at, is_read, sender_id")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Б) Считаем количество непрочитанных (где мы НЕ авторы)
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .eq("is_read", false)
            .neq("sender_id", userId); // Только те, что написали нам

          let displayInfo = { full_name: "", avatar_url: null };

          if (payload.role === UserRole.CLIENT) {
            displayInfo = {
              full_name: (chat as any).sellers?.storeName || "Магазин",
              avatar_url: (chat as any).sellers?.avatarUrl || null,
            };
          } else {
            const u = (chat as any).users;
            displayInfo = {
              full_name: u ? `${u.first_name} ${u.last_name}` : "Клиент",
              avatar_url:
                (chat as any).users?.customers?.[0]?.avatar_url || null,
            };
          }

          return {
            id: chat.id,
            displayInfo,
            lastMessage: lastMsg || null,
            unreadCount: unreadCount || 0,
          };
        }),
      );

      // 3. Сортируем: чаты со свежими сообщениями поднимаем наверх
      chatsWithDetails.sort((a, b) => {
        const dateA = a.lastMessage
          ? new Date(a.lastMessage.created_at).getTime()
          : 0;
        const dateB = b.lastMessage
          ? new Date(b.lastMessage.created_at).getTime()
          : 0;
        return dateB - dateA;
      });

      return res.status(200).json(chatsWithDetails);
    } catch (error) {
      console.error("Get My Chats Error:", error);
      return res.status(500).json({ message: "Ошибка получения списка чатов" });
    }
  }
}
