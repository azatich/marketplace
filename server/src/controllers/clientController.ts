import { supabase } from "../server";
import { Request, Response } from "express";
import { JWTUtils } from "../utils/jwt";
import { UserRole } from "../types";
import bcrypt from "bcryptjs";

export class ClientController {
  static async getProducts(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        subcategory,
        minPrice,
        maxPrice,
        hasDiscount,
        sortBy,
        sortOrder,
        page = "1",
        limit = "12",
      } = req.query;

      let query = supabase
        .from("products")
        .select("*")
        .eq("visibility", true)
        .gt("quantity", 0); // Только товары в наличии

      // Поиск по названию и описанию
      if (search && typeof search === "string") {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Фильтр по категории
      if (category && typeof category === "string") {
        query = query.eq("category", category);
      }

      // Фильтр по подкатегории
      if (subcategory && typeof subcategory === "string") {
        query = query.eq("subcategory", subcategory);
      }

      // Фильтр по цене
      if (minPrice) {
        query = query.gte("price", parseFloat(minPrice as string));
      }
      if (maxPrice) {
        query = query.lte("price", parseFloat(maxPrice as string));
      }

      // Фильтр по наличию скидки
      if (hasDiscount === "true") {
        query = query.not("discount_price", "is", null);
      }

      // Сортировка
      if (sortBy) {
        const order = sortOrder === "desc" ? false : true;
        switch (sortBy) {
          case "price":
            query = query.order("price", { ascending: order });
            break;
          case "created_at":
            query = query.order("created_at", { ascending: order });
            break;
          case "discount":
            // Сортировка по размеру скидки (нужно вычислить процент)
            // Пока используем сортировку по discount_price
            query = query.order("discount_price", { ascending: order });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Пагинация
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      query = query.range(from, to);

      // Получаем общее количество для пагинации
      const countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("visibility", true)
        .gt("quantity", 0);

      if (search && typeof search === "string") {
        countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (category && typeof category === "string") {
        countQuery.eq("category", category);
      }
      if (subcategory && typeof subcategory === "string") {
        countQuery.eq("subcategory", subcategory);
      }
      if (minPrice) {
        countQuery.gte("price", parseFloat(minPrice as string));
      }
      if (maxPrice) {
        countQuery.lte("price", parseFloat(maxPrice as string));
      }
      if (hasDiscount === "true") {
        countQuery.not("discount_price", "is", null);
      }

      const { data, error } = await query;
      const { count } = await countQuery;

      if (error) {
        console.error("Ошибка при получении товаров:", error);
        return res.status(500).json({
          message: "Ошибка при получении товаров",
          error: error.message,
        });
      }

      // Получаем информацию о продавцах для товаров
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map((p) => p.seller_id))];

        const { data: sellersData, error: sellersError } = await supabase
          .from("sellers")
          .select(
            `
            user_id,
            id,
            storeName,
            avatarUrl,
            users (
              first_name,
              last_name
            )
          `,
          )
          .in("user_id", sellerIds);

        if (!sellersError && sellersData) {
          // Создаем мапу для быстрого поиска продавца по user_id
          const sellersMap = new Map(sellersData.map((s) => [s.user_id, s]));

          // Объединяем данные
          const productsWithSellers = data.map((product) => ({
            ...product,
            sellers: sellersMap.get(product.seller_id) || undefined,
          }));

          return res.status(200).json({
            products: productsWithSellers,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: count || 0,
            },
          });
        }
      }

      return res.status(200).json({
        products: data || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
        },
      });
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  // Получение одного товара по ID
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("visibility", true)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      // Получаем информацию о продавце
      const { data: sellerData, error: sellerError } = await supabase
        .from("sellers")
        .select(
          `
          user_id,
          id,
          storeName,
          description,
          avatarUrl,
          phone,
          users (
            first_name,
            last_name,
            email
          )
        `,
        )
        .eq("user_id", data.seller_id)
        .single();

      if (!sellerError && sellerData) {
        return res.status(200).json({
          ...data,
          sellers: sellerData,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  // Получение категорий для фильтров
  static async getCategories(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category, subcategory")
        .eq("visibility", true)
        .gt("quantity", 0);

      if (error) {
        return res.status(500).json({
          message: "Ошибка при получении категорий",
          error: error.message,
        });
      }

      // Группируем категории и подкатегории
      const categoriesMap = new Map<string, Set<string>>();
      data?.forEach((item) => {
        if (!categoriesMap.has(item.category)) {
          categoriesMap.set(item.category, new Set());
        }
        if (item.subcategory) {
          categoriesMap.get(item.category)?.add(item.subcategory);
        }
      });

      const categories = Array.from(categoriesMap.entries()).map(
        ([category, subcategories]) => ({
          category,
          subcategories: Array.from(subcategories),
        }),
      );

      return res.status(200).json(categories);
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "Неавторизован" });

      const payload = await JWTUtils.verify(token);
      if (!payload || payload.role !== UserRole.CLIENT) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const {
        first_name,
        last_name,
        username,
        password,
        phone,
        gender,
        birth_date,
        addresses,
      } = req.body;

      const avatarFile = req.file;

      // 1. Проверяем существование клиента
      const { data: clientData, error: clientError } = await supabase
        .from("customers")
        .select("user_id, avatar_url")
        .eq("user_id", payload.userId)
        .single();

      if (clientError || !clientData) {
        return res.status(404).json({ message: "Клиент не найден" });
      }

      let avatarUrl = clientData.avatar_url;

      // 2. Обработка загрузки аватара (если файл передан)
      if (avatarFile) {
        // Удаляем старый файл, если он был
        if (clientData.avatar_url) {
          const oldPath = clientData.avatar_url.split("/avatars/")[1];
          if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
        }

        const fileExt = avatarFile.originalname.split(".").pop();
        const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile.buffer, {
            contentType: avatarFile.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);
        avatarUrl = publicUrl;
      }

      // 3. Обновление таблицы USERS (имя, фамилия, пароль)
      const userUpdateData: any = { updated_at: new Date().toISOString() };
      if (first_name) userUpdateData.first_name = first_name;
      if (last_name) userUpdateData.last_name = last_name;
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 1) {
        const { error: uError } = await supabase.from("users").update(userUpdateData).eq("id", payload.userId);
        if (uError) throw uError;
      }

      // 4. Обновление таблицы CUSTOMERS
      const clientUpdateData: any = { 
          updated_at: new Date().toISOString(),
          avatar_url: avatarUrl // Обновляем ссылку на аватар
      };

      if (username !== undefined) clientUpdateData.username = username;
      if (phone !== undefined) clientUpdateData.phone = phone;
      if (gender !== undefined) clientUpdateData.gender = gender;
      if (birth_date !== undefined) clientUpdateData.birth_date = birth_date;
      
      // Обработка адресов (парсим из строки JSON)
      if (addresses !== undefined) {
        clientUpdateData.addresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
      }

      const { error: cError } = await supabase
        .from("customers") // ИСПРАВЛЕНО: была таблица sellers
        .update(clientUpdateData)
        .eq("user_id", payload.userId);

      if (cError) throw cError;

      return res.status(200).json({ message: "Профиль успешно обновлен" });

    } catch (error: any) {
      console.error("Update Profile Error:", error);
      return res.status(500).json({ message: "Ошибка при обновлении профиля", error: error.message });
    }
  }
}
