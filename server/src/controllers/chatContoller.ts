import { Response } from "express";
import { supabase } from "../server";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../types";

export class ChatController {
  static async getOrCreateChat(req: AuthRequest, res: Response) {
    try {
      let clientId: string;
      let sellerId: string;

      if (req.user!.role === UserRole.CLIENT) {
        clientId = req.user!.userId;
        sellerId = req.body.sellerId;

        if (!sellerId) {
          return res.status(400).json({ message: "Не указан sellerId" });
        }
      } else {
        sellerId = req.user!.userId;
        clientId = req.body.clientId;

        if (!clientId) {
          return res.status(400).json({ message: "Не указан clientId" });
        }
      }

      let { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("id")
        .eq("client_id", clientId)
        .eq("seller_id", sellerId)
        .maybeSingle();

      if (chatError) {
        return res.status(500).json({ success: false, message: chatError.message });
      }

      if (!chat) {
        const { data: newChat, error: newChatError } = await supabase
          .from("chats")
          .insert({ client_id: clientId, seller_id: sellerId })
          .select("id")
          .single();

        if (newChatError) {
          return res.status(500).json({ success: false, message: newChatError.message });
        }

        chat = newChat;
      }

      return res.status(200).json({ chatId: chat.id });
    } catch (error) {
      console.error("Chat Error:", error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getChatMessages(req: AuthRequest, res: Response) {
    try {
      const { chatId } = req.params;

      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("client_id, seller_id")
        .eq("id", chatId)
        .single();

      if (chatError || !chat) {
        return res.status(404).json({ message: "Чат не найден" });
      }

      if (req.user!.userId !== chat.client_id && req.user!.userId !== chat.seller_id) {
        return res.status(403).json({ message: "Чужой чат" });
      }

      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      const companionId =
        req.user!.userId === chat.client_id ? chat.seller_id : chat.client_id;

      return res.status(200).json({ messages: messages || [], companionId });
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getMyChats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;

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

      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("text, created_at, is_read, sender_id")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .eq("is_read", false)
            .neq("sender_id", userId);

          let displayInfo = { full_name: "", avatar_url: null };

          if (role === UserRole.CLIENT) {
            displayInfo = {
              full_name: (chat as any).sellers?.storeName || "Магазин",
              avatar_url: (chat as any).sellers?.avatarUrl || null,
            };
          } else {
            const u = (chat as any).users;
            displayInfo = {
              full_name: u ? `${u.first_name} ${u.last_name}` : "Клиент",
              avatar_url: (chat as any).users?.customers?.[0]?.avatar_url || null,
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

      chatsWithDetails.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return dateB - dateA;
      });

      return res.status(200).json(chatsWithDetails);
    } catch (error) {
      console.error("Get My Chats Error:", error);
      return res.status(500).json({ message: "Ошибка получения списка чатов" });
    }
  }
}
