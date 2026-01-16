import express from 'express'
import { SellerController } from '../controllers/sellerController';

const router = express.Router();

router.post('/products', SellerController.addProduct)
router.get('/products', SellerController.getSellerProducts)
router.delete('/products/:id', SellerController.deleteProduct)
router.post('/products/toggle-visibility/:id', SellerController.toggleProductVisibility)


export default router;