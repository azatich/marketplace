import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import cookie from "cookie";
import { JWTUtils } from "../utils/jwt";
import { supabase } from "../server";

const onlineUsers = new Map<string, string>();

export const initWebSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "https://youmarket-azat.vercel.app"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) return next(new Error("No cookies found"));

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.token;
      if (!token) return next(new Error("No token found"));

      const payload = await JWTUtils.verify(token);
      if (!payload) return next(new Error("Invalid token"));

      socket.data.user = payload;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    onlineUsers.set(user.userId, socket.id);
    io.emit("user_status_change", { userId: user.userId, isOnline: true });

    socket.on("check_online_status", (targetUserId: string) => {
      const isOnline = onlineUsers.has(targetUserId);
      socket.emit("user_status_change", { userId: targetUserId, isOnline });
    });

    socket.on("join_chat", async (chatId: string) => {
      socket.join(chatId);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .neq("sender_id", user.userId)
        .eq("is_read", false);

      socket.to(chatId).emit("messages_read");
    });

    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(chatId).emit("user_typing", {
        userId: user.userId,
        isTyping,
      });
    });

    socket.on(
      "send_message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { data: savedMessages, error } = await supabase
            .from("messages")
            .insert({
              chat_id: data.chatId,
              sender_id: user.userId,
              text: data.text,
              is_read: false,
            })
            .select()
            .single();

          if (error) throw error;

          io.to(data.chatId).emit("receive_message", savedMessages);
        } catch (error) {
          console.error("Socket send message error: ", error);
        }
      },
    );

    socket.on("mark_as_read", async (messageId: string, chatId: string) => {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);

      socket.to(chatId).emit("messages_read");
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(user.userId);
      io.emit("user_status_change", { userId: user.userId, isOnline: false });
    });
  });
};
