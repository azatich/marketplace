import express from "express";
import { OrderController } from "../controllers/orderController";

const router = express.Router()

router.post('/create-order', OrderController.createOrder)
router.get('/client-orders', OrderController.getClientOrders)
router.get('/seller-orders', OrderController.getSellerOrders)

export default router;