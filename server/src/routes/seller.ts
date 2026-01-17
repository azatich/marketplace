import express from 'express'
import { SellerController } from '../controllers/sellerController';

const router = express.Router();

router.get('/products', SellerController.getSellerProducts)
router.get('/products/:id', SellerController.getSingleProduct)

router.post('/products', SellerController.addProduct)
router.post('/products/toggle-visibility/:id', SellerController.toggleProductVisibility)

router.delete('/products/:id', SellerController.deleteProduct)

router.put('/products/:id', SellerController.updateProduct)



export default router;