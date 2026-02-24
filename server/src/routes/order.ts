import express from "express";
import { OrderController } from "../controllers/orderController";

const router = express.Router()

router.post('/create-order', OrderController.createOrder)
router.get('/client-orders', OrderController.getClientOrders)
router.post('/client-orders/hide', OrderController.hideCanceledOrdersFromClient)
router.get('/seller-orders', OrderController.getSellerOrders)
router.patch('/status/:id', OrderController.updateOrderStatus)

export default router;