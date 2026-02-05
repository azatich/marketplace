import express from "express";
import { ClientController } from "../controllers/clientController";
import multer from "multer";

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум на файл
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Аватар должен быть изображением'));
    }
    cb(null, true);
  },
});

router.get("/products", ClientController.getProducts);
router.get("/products/:id", ClientController.getProductById);
router.get("/categories", ClientController.getCategories);
router.put('/profile', upload.single('avatar'), ClientController.updateProfile)

export default router;

