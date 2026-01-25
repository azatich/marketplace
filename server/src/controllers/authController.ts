import { Request, Response } from "express";
import { supabase } from "../server.js";
import bcrypt from "bcryptjs";
import { SignUpResponse, UserRole } from "../types/index.js";
import { JWTUtils } from "../utils/jwt.js";
import { fail } from "assert";

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

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const { data: userDataInUsersTable, error: userError } = await supabase
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

      if (userError || !userDataInUsersTable) {
        console.error("User creation error:", userError);
        res.status(500).json({
          success: false,
          message: "Ошибка при создании пользователя",
          error: userError?.message,
        });
        return;
      }

      // Не выдаем токен и не устанавливаем cookie для продавца, который еще не одобрен.
      // Просто сообщаем, что заявка принята.
      res.status(201).json({
        success: true,
        message: "Заявка на регистрацию продавца успешно отправлена. Ожидайте одобрения.",
      });

      const { data: userDataInSellersTable, error: sellerError } =
        await supabase
          .from("sellers")
          .insert({
            user_id: userDataInUsersTable.id,
            storeName,
            description,
            phone,
            category,
            approved: false,
          })
          .select()
          .single();

      if (sellerError) {
        await supabase.from("users").delete().eq("id", userDataInUsersTable.id);

        res.status(500).json({
          success: false,
          message: "Ошибка создания профиля продавца",
          error: sellerError,
        });
        return;
      }

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
            addresses,
          )
          `)
          .eq('id', payload.userId)
          .single()

          if (clientFetchError) {
            return res.status(500).json({
              success: false,
              message: 'Ошибка при получении клиента',
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
          approved
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
