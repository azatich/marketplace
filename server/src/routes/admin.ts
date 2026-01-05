import express from 'express'
import { AdminController } from '../controllers/adminController'

const router = express.Router();

router.get('/', AdminController.getAllUsers)
router.get('/sellers', AdminController.getSellers)
router.get('/clients', AdminController.getClients)

router.delete('/:id', AdminController.deleteUser)

router.patch('/approve-seller/:id', AdminController.approveSeller)
router.patch('/reject-seller/:id', AdminController.rejectSeller)

export default router;