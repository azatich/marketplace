import express from "express";
import { OrderController } from "../controllers/orderController";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserRole } from "../types";

const router = express.Router();

// Клиентские маршруты
router.post('/create-order', requireAuth, requireRole(UserRole.CLIENT), OrderController.createOrder);
router.get('/client-orders', requireAuth, requireRole(UserRole.CLIENT), OrderController.getClientOrders);
router.post('/client-orders/hide', requireAuth, requireRole(UserRole.CLIENT), OrderController.hideCanceledOrdersFromClient);

// Продавческие маршруты
router.get('/seller-orders', requireAuth, requireRole(UserRole.SELLER), OrderController.getSellerOrders);
router.patch('/status/:id', requireAuth, requireRole(UserRole.SELLER), OrderController.updateOrderStatus);

export default router;
