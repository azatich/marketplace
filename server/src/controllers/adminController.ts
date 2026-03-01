import { supabase } from "../server";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../types";

export class AdminController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Ошибка при получении пользователей",
        });
      }

      return res.status(200).json({ data: users });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user!.userId === id) {
        return res.status(400).json({ message: "Нельзя удалить собственного пользователя" });
      }

      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) {
        return res.status(500).json({ message: "Ошибка при удалении пользователя" });
      }

      return res.status(200).json({ message: "Пользователь успешно удален" });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getSellers(req: AuthRequest, res: Response) {
    try {
      const { data: sellers, error } = await supabase
        .from("users")
        .select(`
          id,
          email, 
          first_name,
          last_name,
          role,
          created_at,
          sellers (
            storeName,
            description,
            phone,
            category,
            approved
          )
        `)
        .eq("role", UserRole.SELLER);

      if (error) {
        return res.status(500).json({ message: "Ошибка при получении продавцов" });
      }

      return res.status(200).json({ data: sellers });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getClients(req: AuthRequest, res: Response) {
    try {
      const { data: clients, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", UserRole.CLIENT);

      if (error) {
        return res.status(500).json({ message: "Ошибка при получении клиентов" });
      }

      return res.status(200).json({ data: clients });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async approveSeller(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("sellers")
        .update({ approved: true })
        .eq("user_id", id);

      if (error) {
        return res.status(500).json({ message: "Ошибка при одобрении продавца" });
      }

      return res.status(200).json({ message: "Продавец успешно одобрен" });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async rejectSeller(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("sellers")
        .update({ approved: false })
        .eq("user_id", id);

      if (error) {
        return res.status(500).json({ message: "Ошибка при отклонении продавца" });
      }

      return res.status(200).json({ message: "Продавец успешно отклонен" });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }
}
