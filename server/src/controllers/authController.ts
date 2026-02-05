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
        role: UserRole.CLIENT,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 3600 * 24 * 7,
      });

      const response: SignUpResponse = {
        success: true,
        message: "Регистрация успешна",
        token,
        user: {
          id: userData.id,
          email,
          firstName,
          lastName,
        },
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

static async sellerSignup(req: Request, res: Response) {
  try {
    const {
      email,
      password,
      storeName,
      description,
      category,
      sellerFirstName,
      sellerLastName,
      phone,
    } = req.body;

    // 1. Проверка email (как и было)
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email уже занят" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Создаем пользователя (Триггер в БД тут же создаст запись в 'sellers')
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        password: passwordHash,
        first_name: sellerFirstName,
        last_name: sellerLastName,
        role: UserRole.SELLER,
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error("User creation error:", userError);
      return res.status(500).json({ success: false, message: "Ошибка создания пользователя" });
    }

    const { error: sellerError } = await supabase
      .from("sellers")
      .update({
        storeName,      // Обновляем реальным названием магазина
        description,
        phone,
        category,
        approved: false // На всякий случай подтверждаем статус
      })
      .eq("user_id", userData.id); // Привязываемся к созданному ID

    if (sellerError) {
      await supabase.from("users").delete().eq("id", userData.id);
      return res.status(500).json({
        success: false,
        message: "Ошибка при заполнении данных магазина",
        error: sellerError.message
      });
    }

    // 4. И только в самом конце отправляем ОДИН ответ
    return res.status(201).json({
      success: true,
      message: "Заявка принята. Ожидайте одобрения администратором.",
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Внутренняя ошибка сервера" });
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

      const isPasswordValid = await bcrypt.compare(userPassword, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Неверный email или пароль",
        });
        return;
      }

      if (user.role === UserRole.SELLER) {
        const { data: seller, error: sellerError } = await supabase
          .from("sellers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (sellerError || !seller) {
          res.status(500).json({
            success: false,
            message: "Ошибка при проверке статуса продавца",
          });
          return;
        }

        if (seller.approved === false) {
          res.status(403).json({
            success: false,
            message: "Ваша заявка все еще в обработке",
          });
          return;
        }
      }

      const token = JWTUtils.generate({
        userId: user.id,
        role: user.role,
      });

      const { password, ...userWithoutPassword } = user;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 3600 * 24 * 7,
      })
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

  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
      })

      return res.status(200).json({
        success: true,
        message: 'Успешный выход'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      })
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const token = req.cookies.token

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Токен не предоставлен",
        });
      }

      const payload = JWTUtils.verify(token)

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: "Недействительный токен",
        });
      }

      if (payload.role === UserRole.CLIENT) {
        const {data: clientData, error: clientFetchError} = await supabase
        .from('users') 
        .select(`
          id,
          email, 
          first_name,
          last_name,
          role,
          created_at,
          updated_at,
          customers (
            username,
            phone,
            avatar_url,
            gender,
            birth_date,
            addresses
          )
          `)
          .eq('id', payload.userId)
          .single()

          if (clientFetchError) {
            return res.status(500).json({
              success: false,
              message: clientFetchError.message,
            })
          }

          return res.status(200).json(clientData)
      }

      if (payload.role === UserRole.SELLER) {
        const { data: sellersData, error: errorFetchSellers } = await supabase
        .from("users")
        .select(
          `
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
          approved,
          avatarUrl
        )
        `
        )
        .eq('id', payload.userId)
        .single();

        if (errorFetchSellers) {
          return res.status(500).json({
            success: false,
            message: "Ошибка при получении продавцов",
          });
        }

        return res.status(200).json(sellersData)
      }

      return res.status(403).json({
        success: false,
        message: "Доступ запрещен",
      });

    } catch (error) {
      
    }
  }
}
