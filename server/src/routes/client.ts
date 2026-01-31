import express from "express";
import { ClientController } from "../controllers/clientController";

const router = express.Router();

// Публичные роуты (не требуют авторизации)
router.get("/products", ClientController.getProducts);
router.get("/products/:id", ClientController.getProductById);
router.get("/categories", ClientController.getCategories);

export default router;

