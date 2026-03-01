import express from 'express'
import multer from 'multer';
import { SellerController } from '../controllers/sellerController';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

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

router.use(requireAuth, requireRole(UserRole.SELLER));

router.get('/products', SellerController.getSellerProducts);
router.get('/products/:id', SellerController.getSingleProduct);

router.post('/products', upload.array('images', 10), SellerController.addProduct);
router.post('/products/toggle-visibility/:id', SellerController.toggleProductVisibility);
router.post('/products/handle-cancellation/:id', SellerController.handleCancellation);

router.delete('/products/:id', SellerController.deleteProduct);

router.put('/products/:id', SellerController.updateProduct);
router.put('/profile', upload.single('avatar'), SellerController.updateProfile);

router.get('/dashboard-stats', SellerController.getDashboardStats);

export default router;
