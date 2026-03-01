import express from "express";
import { ClientController } from "../controllers/clientController";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserRole } from "../types";

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Аватар должен быть изображением'));
    }
    cb(null, true);
  },
});

// Публичные маршруты (без авторизации — каталог доступен всем)
router.get("/products", ClientController.getProducts);
router.get("/products/:id", ClientController.getProductById);
router.get("/categories", ClientController.getCategories);

// Защищённые маршруты (только клиент)
router.put('/profile', requireAuth, requireRole(UserRole.CLIENT), upload.single('avatar'), ClientController.updateProfile);
router.post('/request-cancellation', requireAuth, requireRole(UserRole.CLIENT), ClientController.requestCancellation);

export default router;
