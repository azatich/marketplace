import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./connect.js";
import authRouter from "./routes/auth";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = connectDb(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true, // для работы с cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { supabase };