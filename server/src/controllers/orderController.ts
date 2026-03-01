import { supabase } from "../server";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const { items, shipping_address, total_price, payment_method } = req.body;

      if (!items || !items.length || !shipping_address || !total_price || !payment_method) {
        return res.status(400).json({ message: "Не все обязательные поля заполнены" });
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: req.user!.userId,
          shipping_address,
          total_price,
          payment_method,
          status: "paid",
        })
        .select()
        .single();

      if (orderError || !orderData) {
        return res.status(500).json({
          message: "Ошибка при создании заказа",
          error: orderError?.message,
        });
      }

      const productIds = items.map((item: any) => item.product_id);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, seller_id")
        .in("id", productIds);

      if (productsError || !productsData) {
        await supabase.from("orders").delete().eq("id", orderData.id);
        return res.status(500).json({
          message: "Ошибка при получении данных о товарах",
          error: productsError?.message,
        });
      }

      const orderItemsToInsert = items.map((item: any) => {
        const productDbInfo = productsData.find((p) => p.id === item.product_id);

        if (!productDbInfo) {
          throw new Error(`Товар с ID ${item.product_id} не найден в базе данных`);
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

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) {
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

  static async getClientOrders(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          shipping_address,
          total_price,
          payment_method,
          status,
          order_items(
            id,
            product_id,
            seller_id,
            quantity,
            price_at_purchase,
            status,
            products (
              title,
              images
            ),
            cancellation_requests ( reason, status, initiated_by )
          )
        `)
        .eq("user_id", req.user!.userId)
        .eq('is_hidden_by_client', false)
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
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async hideCanceledOrdersFromClient(req: AuthRequest, res: Response) {
    try {
      const { orderIds } = req.body;

      if (!orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ message: "Не переданы ID заказов" });
      }

      const { error } = await supabase
        .from("orders")
        .update({ is_hidden_by_client: true })
        .in("id", orderIds)
        .eq("user_id", req.user!.userId);

      if (error) {
        return res.status(500).json({
          message: "Ошибка при скрытии заказов",
          error: error.message,
        });
      }

      return res.status(200).json({ message: "Заказы успешно скрыты", hiddenIds: orderIds });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async getSellerOrders(req: AuthRequest, res: Response) {
    try {
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
              id,
              first_name,
              last_name,
              email,
              customers (
                phone
              )
            ) 
          ),
          cancellation_requests ( reason, status, initiated_by )
        `)
        .eq("seller_id", req.user!.userId)
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
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Проверяем, что товар принадлежит этому продавцу
      const { data: item, error: itemError } = await supabase
        .from("order_items")
        .select("id, seller_id")
        .eq("id", id)
        .eq("seller_id", req.user!.userId)
        .single();

      if (itemError || !item) {
        return res.status(403).json({ message: "Товар не найден или доступ запрещен" });
      }

      const { error } = await supabase
        .from("order_items")
        .update({ status })
        .eq("id", id);

      if (error) {
        return res.status(500).json({
          message: "Ошибка при обновлении статуса заказа",
          error: error.message,
        });
      }

      return res.status(200).json({ message: "Статус заказа успешно обновлен" });
    } catch (error) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  }
}
