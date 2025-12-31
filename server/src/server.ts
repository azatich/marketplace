import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./connect.js";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin.js";


dotenv.config();

const app = express();
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { supabase };