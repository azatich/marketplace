import { supabase } from "../server";
import { Request, Response } from "express";
import { JWTUtils } from "../utils/jwt";
import { UserRole } from "../types";
import { error } from "console";

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "Неавторизован" });

      const payload = await JWTUtils.verify(token);
      if (!payload || payload.role !== UserRole.CLIENT) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { items, shipping_address, total_price, payment_method } = req.body;

      if (
        !items ||
        !items.length ||
        !shipping_address ||
        !total_price ||
        !payment_method
      ) {
        return res
          .status(400)
          .json({ message: "Не все обязательные поля заполнены" });
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: payload.userId,
          shipping_address,
          total_price,
          payment_method,
          status: "pending",
        })
        .select()
        .single();

      if (orderError || !orderData) {
        return res.status(500).json({
          message: "Ошибка при создании заказа",
          error: orderError?.message,
        });
      }

      // 2. Получаем массив ID всех товаров из корзины
      const productIds = items.map((item: any) => item.product_id);

      // 3. Делаем ОДИН запрос, чтобы получить seller_id для всех этих товаров
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, seller_id")
        .in("id", productIds);

      if (productsError || !productsData) {
        // В идеале здесь нужно удалить созданный orderData, так как процесс прервался
        await supabase.from("orders").delete().eq("id", orderData.id);
        return res.status(500).json({
          message: "Ошибка при получении данных о товарах",
          error: productsError?.message,
        });
      }

      // 4. Формируем массив для вставки в order_items
      const orderItemsToInsert = items.map((item: any) => {
        // Ищем товар из БД, чтобы достать его seller_id
        const productDbInfo = productsData.find(
          (p) => p.id === item.product_id,
        );

        if (!productDbInfo) {
          throw new Error(
            `Товар с ID ${item.product_id} не найден в базе данных`,
          );
        }

        return {
          order_id: orderData.id,
          product_id: item.product_id,
          seller_id: productDbInfo.seller_id,
          quantity: item.quantity,
          price_at_purchase: item.price,
          status: "processing",
        };
      });

      // 5. Массовая вставка (Bulk Insert) товаров заказа
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) {
        // Откат: если товары не добавились, удаляем шапку заказа
        await supabase.from("orders").delete().eq("id", orderData.id);
        return res.status(500).json({
          message: "Ошибка при сохранении товаров заказа",
          error: itemsError.message,
        });
      }

      return res.status(201).json({
        message: "Заказ успешно создан",
        orderId: orderData.id,
      });
    } catch (error: any) {
      console.error("Create Order Error:", error);
      return res.status(500).json({
        message: "Внутренняя ошибка сервера",
        error: error.message,
      });
    }
  }

  static async getClientOrders(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "Неавторизован" });

      const payload = await JWTUtils.verify(token);
      if (!payload || payload.role !== UserRole.CLIENT) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
                id,
                created_at,
                shipping_address,
                total_price,
                payment_method,
                status,
                order_items(
                    id,
                    product_id,
                    quantity,
                    price_at_purchase,
                    status,
                    products (
                        title,
                        images
                    )
                )
                `,
        )
        .eq("user_id", payload.userId)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({
          message: "Ошибка при получении заказов",
          error: error.message,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Get Client Orders Error:", error);
    }
  }

  static async getSellerOrders(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Неавторизован" });
      }

      const payload = JWTUtils.verify(token);

      if (!payload) {
        return res.status(403).json({ message: "Неавторизован" });
      }

      if (payload.role !== UserRole.SELLER) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price_at_purchase,
          status,
          created_at,

          products (
            title,
            images
          ),

          orders (
            shipping_address,
            status,
            created_at,

            users (
              first_name,
              last_name,
              email,
              
              customers (
                phone
              )
            ) 
          )
        `)
        .eq("seller_id", payload.userId)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({
          message: "Ошибка при получении заказов",
          error: error.message,
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Get Seller Orders Error:", error);
    }
  }
}
