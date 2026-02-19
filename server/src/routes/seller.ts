import express from 'express'
import multer from 'multer';
import { SellerController } from '../controllers/sellerController';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум на файл
  },
  fileFilter: (req, file, cb) => {
    // Для аватара проверяем, что это изображение
    if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Аватар должен быть изображением'));
    }
    cb(null, true);
  },
});

router.get('/products', SellerController.getSellerProducts)
router.get('/products/:id', SellerController.getSingleProduct)

router.post('/products', upload.array('images', 10), SellerController.addProduct)
router.post('/products/toggle-visibility/:id', SellerController.toggleProductVisibility)

router.delete('/products/:id', SellerController.deleteProduct)

router.put('/products/:id', SellerController.updateProduct)
router.put('/profile', upload.single('avatar'), SellerController.updateProfile)

router.get('/dashboard-stats', SellerController.getDashboardStats)



export default router;