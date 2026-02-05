import { supabase } from "../server";
import { Request, Response } from "express";
import { JWTUtils } from "../utils/jwt";
import { UserRole } from "../types";
import bcrypt from "bcryptjs";

export class SellerController {
  static async getSellerProducts(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      if (payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", payload.userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка при получении продуктов:", error);
        return res.status(500).json({
          message: "Ошибка при получении продуктов",
          error: error.message,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async getSingleProduct(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload || payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { id } = req.params;

      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("id, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== payload.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (error) {
        return res.status(500).json({
          message: "Ошибка при получении продукта",
          error: error.message,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async addProduct(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      if (payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const {
        title,
        description,
        category,
        subcategory,
        quantity,
        price,
        discountedPrice: discount_price,
        visibility,
      } = req.body;

      // Получаем файлы из multer
      const files = req.files as Express.Multer.File[];

      // Валидация обязательных полей
      if (
        !title ||
        !category ||
        !subcategory ||
        !price ||
        quantity === undefined
      ) {
        return res.status(400).json({
          message: "Не все обязательные поля заполнены",
        });
      }

      // Валидация изображений
      if (!files || files.length === 0) {
        return res.status(400).json({
          message: "Необходимо загрузить хотя бы одно изображение",
        });
      }

      // Валидация цены
      if (parseFloat(price) <= 0) {
        return res.status(400).json({
          message: "Цена должна быть больше 0",
        });
      }

      // Валидация скидочной цены
      if (discount_price && parseFloat(discount_price) >= parseFloat(price)) {
        return res.status(400).json({
          message: "Цена со скидкой должна быть меньше обычной цены",
        });
      }

      // Валидация количества
      if (parseInt(quantity) < 0) {
        return res.status(400).json({
          message: "Количество не может быть отрицательным",
        });
      }

      // Загружаем изображения в Supabase Storage
      const imageUrls: string[] = [];
      
      for (const file of files) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.mimetype,
          });

        if (uploadError) {
          console.error("Ошибка загрузки изображения:", uploadError);
          // Удаляем уже загруженные изображения при ошибке
          for (const url of imageUrls) {
            const path = url.split("/product-images/")[1];
            if (path) {
              await supabase.storage.from("product-images").remove([path]);
            }
          }
          return res.status(500).json({
            message: "Ошибка при загрузке изображений",
            error: uploadError.message,
          });
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

        imageUrls.push(publicUrl);
      }

      // Вставка продукта в базу данных
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            seller_id: payload.userId,
            title,
            description: description || null,
            category,
            subcategory,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            discount_price: discount_price ? parseFloat(discount_price) : null,
            images: imageUrls,
            visibility: visibility === "true" || visibility === true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Ошибка при добавлении продукта:", error);
        // Удаляем загруженные изображения при ошибке вставки
        for (const url of imageUrls) {
          const path = url.split("/product-images/")[1];
          if (path) {
            await supabase.storage.from("product-images").remove([path]);
          }
        }
        return res.status(500).json({
          message: "Ошибка при добавлении продукта",
          error: error.message,
        });
      }

      return res.status(201).json({
        message: "Продукт успешно добавлен",
        product: data[0],
      });
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      const { id: productId} = req.params;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload || payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const {
        title,
        description,
        category,
        subcategory,
        quantity,
        price,
        discount_price,
        images,
        visibility,
      } = req.body;

      if (parseFloat(price) <= 0) {
        return res.status(400).json({
          message: "Цена должна быть больше 0",
        });
      }

      // Валидация скидочной цены
      if (discount_price && parseFloat(discount_price) >= parseFloat(price)) {
        return res.status(400).json({
          message: "Цена со скидкой должна быть меньше обычной цены",
        });
      }

      // Валидация количества
      if (parseInt(quantity) < 0) {
        return res.status(400).json({
          message: "Количество не может быть отрицательным",
        });
      }

      // Валидация изображений (массив URL уже загружен на frontend)
      if (!Array.isArray(images)) {
        return res.status(400).json({
          message: "Изображения должны быть массивом",
        });
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("seller_id")
        .eq("id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== payload.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      // Обновление продукта
      const { data, error } = await supabase
        .from("products")
        .update({
          title,
          description,
          category,
          subcategory,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          discount_price: discount_price ? parseFloat(discount_price) : null,
          images: images,
          visibility: visibility ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .select();

      if (error) {
        console.error("Ошибка при обновлении продукта:", error);
        return res.status(500).json({
          message: "Ошибка при обновлении продукта",
          error: error.message,
        });
      }

      return res.status(200).json({
        message: "Продукт успешно обновлен",
        product: data[0],
      });
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      const { id: productId } = req.params;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload || payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      // Получаем продукт с изображениями
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("seller_id, images")
        .eq("id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== payload.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      // Удаляем изображения из Storage
      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const imageUrl of existingProduct.images) {
          try {
            const filePath = imageUrl.split("/product-images/")[1];
            if (filePath) {
              await supabase.storage.from("product-images").remove([filePath]);
            }
          } catch (error) {
            console.error("Ошибка при удалении изображения:", error);
          }
        }
      }

      // Удаление продукта
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Ошибка при удалении продукта:", error);
        return res.status(500).json({
          message: "Ошибка при удалении продукта",
          error: error.message,
        });
      }

      return res.status(200).json({
        message: "Продукт успешно удален",
      });
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
      });
    }
  }

  static async toggleProductVisibility(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload || payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { id } = req.params;

      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("id, visibility, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== payload.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      const newVisibility = !existingProduct.visibility;

      const { data, error: updateError } = await supabase
        .from("products")
        .update({ visibility: newVisibility })
        .eq("id", id)
        .select();

      if (updateError) {
        return res.status(500).json({
          message: "Ошибка при обновлении продукта",
          error: updateError.message,
        });
      }

      return res.status(200).json({
        message: `Продукт ${newVisibility ? "показан" : "скрыт"}`,
        product: data[0],
      });
    } catch (error) {
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = await JWTUtils.verify(token);

      if (!payload || payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const {
        firstName,
        lastName,
        phone,
        description,
        password,
      } = req.body;

      // Получаем файл аватара из multer
      const avatarFile = req.file as Express.Multer.File | undefined;

      // Получаем текущего продавца для удаления старого аватара
      const { data: sellerData, error: sellerError } = await supabase
        .from("sellers")
        .select("user_id, avatarUrl")
        .eq("user_id", payload.userId)
        .single();

      if (sellerError || !sellerData) {
        return res.status(404).json({ message: "Продавец не найден" });
      }

      let avatarUrl: string | undefined = undefined;

      // Загружаем новый аватар, если он был передан
      if (avatarFile) {
        // Валидация типа файла
        if (!avatarFile.mimetype.startsWith("image/")) {
          return res.status(400).json({
            message: "Файл должен быть изображением",
          });
        }

        // Валидация размера файла (5MB)
        if (avatarFile.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            message: "Размер файла не должен превышать 5MB",
          });
        }

        // Удаляем старый аватар, если он есть
        if (sellerData.avatarUrl) {
          try {
            const oldPath = sellerData.avatarUrl.split("/avatars/")[1];
            if (oldPath) {
              await supabase.storage.from("avatars").remove([oldPath]);
            }
          } catch (error) {
            console.error("Ошибка при удалении старого аватара:", error);
            // Продолжаем выполнение, даже если не удалось удалить старый аватар
          }
        }

        // Загружаем новый аватар
        const fileExt = avatarFile.originalname.split(".").pop();
        const fileName = `avatars/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: avatarFile.mimetype,
          });

        if (uploadError) {
          console.error("Ошибка загрузки аватара:", uploadError);
          return res.status(500).json({
            message: "Ошибка при загрузке аватара",
            error: uploadError.message,
          });
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);
        
        avatarUrl = publicUrl;
      }

      // Обновляем данные пользователя
      const userUpdateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (firstName) userUpdateData.first_name = firstName;
      if (lastName) userUpdateData.last_name = lastName;
      if (password) {
        const saltRounds = 10;
        userUpdateData.password = await bcrypt.hash(password, saltRounds);
      }

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", payload.userId);

      if (userUpdateError) {
        console.error("Ошибка при обновлении пользователя:", userUpdateError);
        // Если был загружен новый аватар, удаляем его при ошибке
        if (avatarUrl) {
          const path = avatarUrl.split("/avatars/")[1];
          if (path) {
            await supabase.storage.from("avatars").remove([path]);
          }
        }
        return res.status(500).json({
          message: "Ошибка при обновлении данных пользователя",
          error: userUpdateError.message,
        });
      }

      // Обновляем данные продавца
      const sellerUpdateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (phone !== undefined) sellerUpdateData.phone = phone;
      if (description !== undefined) sellerUpdateData.description = description;
      if (avatarUrl !== undefined) sellerUpdateData.avatarUrl = avatarUrl;

      const { error: sellerUpdateError } = await supabase
        .from("sellers")
        .update(sellerUpdateData)
        .eq("user_id", payload.userId);

      if (sellerUpdateError) {
        console.error("Ошибка при обновлении продавца:", sellerUpdateError);
        // Если был загружен новый аватар, удаляем его при ошибке
        if (avatarUrl) {
          const path = avatarUrl.split("/avatars/")[1];
          if (path) {
            await supabase.storage.from("avatars").remove([path]);
          }
        }
        return res.status(500).json({
          message: "Ошибка при обновлении данных продавца",
          error: sellerUpdateError.message,
        });
      }

      return res.status(200).json({
        message: "Профиль успешно обновлен",
      });
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }
}
