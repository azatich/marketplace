import express from 'express'
import { SellerController } from '../controllers/sellerController';

const router = express.Router();

router.post('/products', SellerController.addProduct)


export default router;