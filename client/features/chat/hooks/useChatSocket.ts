import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/app/shared/lib/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // <-- ДОБАВИЛИ ИМПОРТ

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
  is_hidden_from_seller: boolean;
  is_hidden_from_client: boolean;
  deleted_for_everyone_by_client: boolean;
  deleted_for_everyone_by_seller: boolean;
}

interface CustomJwtPayload {
  userId: string;
  role: "client" | "seller" | "admin";
}

export const useChatSocket = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [isCompanionOnline, setIsCompanionOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompanionTyping, setIsCompanionTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        const res = await api.get(`/chats/${chatId}/messages`);
        if (isMounted) {
          setMessages(res.data.messages);
          setCompanionId(res.data.companionId);
          setIsLoading(false);
        }

        socketRef.current = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
          {
            withCredentials: true,
            auth: {
              token: Cookies.get("token"),
            },
          },
        );

        socketRef.current?.on(
          "messages_deleted_for_everyone",
          ({ ids, deletedByRole }) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (ids.includes(msg.id)) {
                  return {
                    ...msg,
                    deleted_for_everyone_by_client:
                      deletedByRole === "client"
                        ? true
                        : msg.deleted_for_everyone_by_client,
                    deleted_for_everyone_by_seller:
                      deletedByRole === "seller"
                        ? true
                        : msg.deleted_for_everyone_by_seller,
                  };
                }
                return msg;
              }),
            );
          },
        );

        const socket = socketRef.current;

        socket.on("connect", () => {
          socket.emit("join_chat", chatId);
          if (res.data.companionId) {
            socket.emit("check_online_status", res.data.companionId);
          }
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
        });

        socket.on("user_typing", ({ userId, isTyping }) => {
          if (userId === res.data.companionId) {
            setIsCompanionTyping(isTyping);
          }
        });

        socket.on("receive_message", (newMessage: Message) => {
          setIsCompanionTyping(false);
          setMessages((prev) => {
            const isDuplicate = prev.some((msg) => msg.id === newMessage.id);
            if (isDuplicate) return prev;
            return [...prev, newMessage];
          });
        });

        socket.on("messages_read", () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender_id !== res.data.companionId
                ? { ...msg, is_read: true }
                : msg,
            ),
          );
        });

        socket.on("user_status_change", ({ userId, isOnline }) => {
          if (userId === res.data.companionId) {
            setIsCompanionOnline(isOnline);
          }
        });
      } catch (error) {
        console.error("Failed to init chat:", error);
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current) {
        socketRef.current.emit("typing", { chatId, isTyping });
      }
    },
    [chatId],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (socketRef.current && text.trim()) {
        socketRef.current.emit("send_message", { chatId, text });
      }
    },
    [chatId],
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      if (socketRef.current) {
        socketRef.current.emit("mark_as_read", messageId, chatId);
      }
    },
    [chatId],
  );

  const deleteMessages = useCallback(
    (ids: string[], forEveryone: boolean) => {
      if (socketRef.current) {
        socketRef.current.emit("delete_messages", { ids, chatId, forEveryone });

        if (forEveryone) {
          // ДИНАМИЧЕСКИ ДОСТАЕМ РОЛЬ ИЗ ТОКЕНА
          let userRole = "client"; // по умолчанию
          const token = Cookies.get("token");
          if (token) {
            try {
              const decoded = jwtDecode<CustomJwtPayload>(token);
              userRole = decoded.role;
            } catch (error) {
              console.error("Ошибка декодирования токена:", error);
            }
          }

          setMessages((prev) =>
            prev.map((msg) => {
              if (ids.includes(msg.id)) {
                return {
                  ...msg,
                  // Обновляем нужную колонку в зависимости от текущей роли
                  deleted_for_everyone_by_client: userRole === "client" ? true : msg.deleted_for_everyone_by_client,
                  deleted_for_everyone_by_seller: userRole === "seller" ? true : msg.deleted_for_everyone_by_seller,
                };
              }
              return msg;
            }),
          );
        } else {
          // Удаление "только у себя" просто вырезает сообщения из UI
          setMessages((prev) => prev.filter((msg) => !ids.includes(msg.id)));
        }
      }
    },
    [chatId],
  );

  return {
    messages,
    isCompanionOnline,
    isLoading,
    isCompanionTyping,
    sendTypingStatus,
    sendMessage,
    markAsRead,
    deleteMessages,
    companionId,
  };
};