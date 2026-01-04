import express from 'express'
import { AdminController } from '../controllers/adminController'

const router = express.Router();

router.get('/', AdminController.getAllUsers)
router.delete('/:id', AdminController.deleteUser)
router.get('/sellers', AdminController.getSellers)
router.get('/clients', AdminController.getClients)

export default router;