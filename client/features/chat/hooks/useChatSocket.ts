"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
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
              token: Cookies.get('token'),
            }
          },
        );

        const socket = socketRef.current;

        socket.on("connect", () => {
          socket.emit("join_chat", chatId);
          if (res.data.companionId) {
            socket.emit("check_online_status", res.data.companionId);
          }
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
        })

        socket.on("user_typing", ({ userId, isTyping }) => {
          if (userId === res.data.companionId) {
            setIsCompanionTyping(isTyping);
          }
        });

        socket.on("receive_message", (newMessage: Message) => {
          setIsCompanionTyping(false);
          setMessages((prev) => {
            const isDuplicate = prev.some((msg) => msg.id === newMessage.id);

            if (isDuplicate) {
              return prev;
            }

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

  return {
    messages,
    isCompanionOnline,
    isLoading,
    isCompanionTyping,
    sendTypingStatus,
    sendMessage,
    markAsRead,
    companionId,
  };
};
