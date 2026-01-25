import express from 'express'
import multer from 'multer';
import { SellerController } from '../controllers/sellerController';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум на файл
  },
});

router.get('/products', SellerController.getSellerProducts)
router.get('/products/:id', SellerController.getSingleProduct)

router.post('/products', upload.array('images', 10), SellerController.addProduct)
router.post('/products/toggle-visibility/:id', SellerController.toggleProductVisibility)

router.delete('/products/:id', SellerController.deleteProduct)

router.put('/products/:id', SellerController.updateProduct)
router.put('/profile', SellerController.updateProfile)



export default router;