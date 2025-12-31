import { supabase } from "../server";
import { Request, Response } from "express";
import { JWTUtils } from "../utils/jwt";
import { UserRole } from "../types";

export class AdminController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Токен не предоставлен",
        });
        return;
      }

      // Проверяем токен
      const payload = JWTUtils.verify(token);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: "Недействительный токен",
        });
        return;
      }

      // Проверяем, что пользователь является администратором
      if (payload.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message:
            "Доступ запрещен. Только администратор может получить список всех пользователей",
        });
        return;
      }

      // Получаем всех пользователей из базы данных
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
          success: false,
          message: "Ошибка при получении пользователей",
        });
        return;
      }

      res.status(200).json({
        data: users,
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = JWTUtils.verify(token);

      if (!payload?.role || payload.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { id } = req.params;

      if (payload.userId === id) {
        return res
          .status(400)
          .json({ message: "Нельзя удалить собственного пользователя" });
      }

      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) {
        return res
          .status(500)
          .json({ message: "Ошибка при удалении пользователя" });
      }

      return res.status(200).json({ message: "Пользователь успешно удален" });
    } catch (error) {}
  }
}
