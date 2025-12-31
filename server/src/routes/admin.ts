import express from 'express'
import { AdminController } from '../controllers/adminController'

const router = express.Router();

router.get('/', AdminController.getAllUsers)

export default router;