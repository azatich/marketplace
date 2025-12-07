import { Request, Response } from "express";
import { supabase } from "../server.js";
import bcrypt from "bcryptjs";
import { SignUpResponse, UserRole } from "../types/index.js";
import { JWTUtils } from "../utils/jwt.js";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: "Все поля обязательны для заполнения",
        });
        return;
      }

      // Проверка существующего пользователя
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "Пользователь с таким email уже существует",
        });
        return;
      }

      // Хешируем пароль
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          email,
          password: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: UserRole.CLIENT,
        })
        .select()
        .single();

      if (userError) {
        console.error("User creation error:", userError);
        res.status(500).json({
          success: false,
          message: "Ошибка при создании пользователя",
        });
        return;
      }

      const token = JWTUtils.generate({
        userId: userData.id,
        role: UserRole.CLIENT
      });

      const response: SignUpResponse = {
        success: true,
        message: 'Регистрация успешна',
        token,
        user: {
          id: userData.id,
          email,
          firstName,
          lastName,
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password: userPassword } = req.body;

      if (!email || !userPassword) {
        res.status(400).json({
          success: false,
          message: "Email и пароль обязательны",
        });
        return;
      }

      // Получаем пользователя по email
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !user) {
        res.status(401).json({
          success: false,
          message: "Неверный email или пароль",
        });
        return;
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(userPassword, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Неверный email или пароль",
        });
        return;
      }

      // Убираем пароль из ответа
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: "Успешный вход",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  }
}