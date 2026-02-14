import express from "express";
import { OrderController } from "../controllers/orderController";

const router = express.Router()

router.post('/create-order', OrderController.createOrder)

export default router;