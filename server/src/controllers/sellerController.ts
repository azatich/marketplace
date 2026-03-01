import { supabase } from "../server";
import { Response } from "express";
import { UserRole } from "../types";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";

export class SellerController {
  static async getSellerProducts(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", req.user!.userId)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({
          message: "Ошибка при получении продуктов",
          error: error.message,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getSingleProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("id, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== req.user!.userId) {
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
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async addProduct(req: AuthRequest, res: Response) {
    try {
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

      const files = req.files as Express.Multer.File[];

      if (!title || !category || !subcategory || !price || quantity === undefined) {
        return res.status(400).json({ message: "Не все обязательные поля заполнены" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Необходимо загрузить хотя бы одно изображение" });
      }

      if (parseFloat(price) <= 0) {
        return res.status(400).json({ message: "Цена должна быть больше 0" });
      }

      if (discount_price && parseFloat(discount_price) >= parseFloat(price)) {
        return res.status(400).json({ message: "Цена со скидкой должна быть меньше обычной цены" });
      }

      if (parseInt(quantity) < 0) {
        return res.status(400).json({ message: "Количество не может быть отрицательным" });
      }

      const imageUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.mimetype,
          });

        if (uploadError) {
          for (const url of imageUrls) {
            const path = url.split("/product-images/")[1];
            if (path) await supabase.storage.from("product-images").remove([path]);
          }
          return res.status(500).json({
            message: "Ошибка при загрузке изображений",
            error: uploadError.message,
          });
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        imageUrls.push(publicUrl);
      }

      const { data, error } = await supabase
        .from("products")
        .insert([{
          seller_id: req.user!.userId,
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
        }])
        .select();

      if (error) {
        for (const url of imageUrls) {
          const path = url.split("/product-images/")[1];
          if (path) await supabase.storage.from("product-images").remove([path]);
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
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id: productId } = req.params;

      const {
        title, description, category, subcategory,
        quantity, price, discount_price, images, visibility,
      } = req.body;

      if (parseFloat(price) <= 0) {
        return res.status(400).json({ message: "Цена должна быть больше 0" });
      }

      if (discount_price && parseFloat(discount_price) >= parseFloat(price)) {
        return res.status(400).json({ message: "Цена со скидкой должна быть меньше обычной цены" });
      }

      if (parseInt(quantity) < 0) {
        return res.status(400).json({ message: "Количество не может быть отрицательным" });
      }

      if (!Array.isArray(images)) {
        return res.status(400).json({ message: "Изображения должны быть массивом" });
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("seller_id")
        .eq("id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== req.user!.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          title, description, category, subcategory,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          discount_price: discount_price ? parseFloat(discount_price) : null,
          images,
          visibility: visibility ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .select();

      if (error) {
        return res.status(500).json({
          message: "Ошибка при обновлении продукта",
          error: error.message,
        });
      }

      return res.status(200).json({ message: "Продукт успешно обновлен", product: data[0] });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id: productId } = req.params;

      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("seller_id, images")
        .eq("id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== req.user!.userId) {
        return res.status(403).json({ message: "Это не ваш продукт" });
      }

      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const imageUrl of existingProduct.images) {
          try {
            const filePath = imageUrl.split("/product-images/")[1];
            if (filePath) await supabase.storage.from("product-images").remove([filePath]);
          } catch (error) {
            console.error("Ошибка при удалении изображения:", error);
          }
        }
      }

      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) {
        return res.status(500).json({
          message: "Ошибка при удалении продукта",
          error: error.message,
        });
      }

      return res.status(200).json({ message: "Продукт успешно удален" });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async toggleProductVisibility(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("id, visibility, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({ message: "Продукт не найден" });
      }

      if (existingProduct.seller_id !== req.user!.userId) {
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

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { firstName, lastName, phone, description, password } = req.body;
      const avatarFile = req.file as Express.Multer.File | undefined;

      const { data: sellerData, error: sellerError } = await supabase
        .from("sellers")
        .select("user_id, avatarUrl")
        .eq("user_id", req.user!.userId)
        .single();

      if (sellerError || !sellerData) {
        return res.status(404).json({ message: "Продавец не найден" });
      }

      let avatarUrl: string | undefined = undefined;

      if (avatarFile) {
        if (!avatarFile.mimetype.startsWith("image/")) {
          return res.status(400).json({ message: "Файл должен быть изображением" });
        }

        if (avatarFile.size > 5 * 1024 * 1024) {
          return res.status(400).json({ message: "Размер файла не должен превышать 5MB" });
        }

        if (sellerData.avatarUrl) {
          try {
            const oldPath = sellerData.avatarUrl.split("/avatars/")[1];
            if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
          } catch (error) {
            console.error("Ошибка при удалении старого аватара:", error);
          }
        }

        const fileExt = avatarFile.originalname.split(".").pop();
        const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: avatarFile.mimetype,
          });

        if (uploadError) {
          return res.status(500).json({
            message: "Ошибка при загрузке аватара",
            error: uploadError.message,
          });
        }

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);
        avatarUrl = publicUrl;
      }

      const userUpdateData: any = { updated_at: new Date().toISOString() };
      if (firstName) userUpdateData.first_name = firstName;
      if (lastName) userUpdateData.last_name = lastName;
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", req.user!.userId);

      if (userUpdateError) {
        if (avatarUrl) {
          const path = avatarUrl.split("/avatars/")[1];
          if (path) await supabase.storage.from("avatars").remove([path]);
        }
        return res.status(500).json({
          message: "Ошибка при обновлении данных пользователя",
          error: userUpdateError.message,
        });
      }

      const sellerUpdateData: any = { updated_at: new Date().toISOString() };
      if (phone !== undefined) sellerUpdateData.phone = phone;
      if (description !== undefined) sellerUpdateData.description = description;
      if (avatarUrl !== undefined) sellerUpdateData.avatarUrl = avatarUrl;

      const { error: sellerUpdateError } = await supabase
        .from("sellers")
        .update(sellerUpdateData)
        .eq("user_id", req.user!.userId);

      if (sellerUpdateError) {
        if (avatarUrl) {
          const path = avatarUrl.split("/avatars/")[1];
          if (path) await supabase.storage.from("avatars").remove([path]);
        }
        return res.status(500).json({
          message: "Ошибка при обновлении данных продавца",
          error: sellerUpdateError.message,
        });
      }

      return res.status(200).json({ message: "Профиль успешно обновлен" });
    } catch (error) {
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const sellerId = req.user!.userId;

      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          order_id,
          quantity, 
          price_at_purchase, 
          created_at,
          products (id, title, images)
        `)
        .eq("seller_id", sellerId);

      if (error) throw error;
      if (!orderItems) return res.status(200).json({ chartData: {}, topProducts: [] });

      const productStats: Record<string, any> = {};

      orderItems.forEach((item: any) => {
        const prod = item.products;
        if (!prod) return;

        if (!productStats[prod.id]) {
          productStats[prod.id] = {
            id: prod.id,
            name: prod.title,
            image: prod.images?.[0] || null,
            sales: 0,
            revenue: 0,
          };
        }
        productStats[prod.id].sales += item.quantity;
        productStats[prod.id].revenue += item.quantity * item.price_at_purchase;
      });

      let totalRevenue = 0;
      const uniqueOrders = new Set();

      orderItems.forEach((item: any) => {
        totalRevenue += item.quantity * item.price_at_purchase;
        if (item.order_id) uniqueOrders.add(item.order_id);
      });

      const { count: totalProducts, error: productsError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      if (productsError) throw productsError;

      const topProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 3);

      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekData = weekDays.map((day) => ({ name: day, value: 0 }));

      orderItems.forEach((item: any) => {
        const date = new Date(item.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          const dayName = weekDays[date.getDay()];
          const dayObj = weekData.find((d) => d.name === dayName);
          if (dayObj) dayObj.value += item.quantity * item.price_at_purchase;
        }
      });

      return res.status(200).json({
        totalRevenue,
        totalOrders: uniqueOrders.size,
        totalProducts: totalProducts || 0,
        topProducts,
        chartData: {
          Week: weekData,
          Day: [],
          Month: [],
          Year: [],
        },
      });
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  static async handleCancellation(req: AuthRequest, res: Response) {
    try {
      const sellerId = req.user!.userId;
      const orderItemId = req.params.id;
      const { action, reason } = req.body;

      const { data: item, error: itemError } = await supabase
        .from("order_items")
        .select("id, status")
        .eq("id", orderItemId)
        .eq("seller_id", sellerId)
        .single();

      if (itemError || !item) {
        return res.status(403).json({ message: "Товар не найден", error: itemError });
      }

      if (action === "cancel_by_seller") {
        await supabase.from("cancellation_requests").insert({
          order_item_id: orderItemId,
          reason: reason || "Отменено продавцом",
          status: "approved",
          initiated_by: "seller",
        });

        await supabase
          .from("order_items")
          .update({ status: "cancelled" })
          .eq("id", orderItemId);

        return res.status(200).json({ message: "Товар успешно отменен" });
      } else if (action === "approve_client" || action === "reject_client") {
        const newStatus = action === "approve_client" ? "approved" : "rejected";

        await supabase
          .from("cancellation_requests")
          .update({ status: newStatus })
          .eq("order_item_id", orderItemId)
          .eq("status", "pending");

        if (newStatus === "approved") {
          await supabase
            .from("order_items")
            .update({ status: "cancelled" })
            .eq("id", orderItemId);
        } else {
          await supabase
            .from("order_items")
            .update({ status: "processing" })
            .eq("id", orderItemId);
        }

        return res.status(200).json({
          message: `Запрос ${newStatus === "approved" ? "одобрен" : "отклонен"}`,
        });
      }

      return res.status(400).json({ message: "Неизвестное действие" });
    } catch (error) {
      console.error("Seller Cancellation Error:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}
