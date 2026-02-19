import express, { Request, Response } from "express";
import http from 'http'
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./connect.js";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin.js";
import sellerRouter from "./routes/seller.js";
import clientRouter from "./routes/client.js";
import orderRouter from "./routes/order.js";
import chatRouter from "./routes/chat.js";
import { initWebSocket } from "./sockets/chat.js";


dotenv.config();

const app = express();

const server = http.createServer(app)
initWebSocket(server);

const PORT = process.env.PORT || 8000;

const supabase = connectDb(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use('/api/users', adminRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/client', clientRouter)
app.use('/api/order', orderRouter)
app.use('/api/chats', chatRouter)

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { supabase };