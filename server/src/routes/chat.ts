import express from 'express' 
import { ChatController } from '../controllers/chatContoller';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(requireAuth, requireRole(UserRole.CLIENT, UserRole.SELLER));

router.post('/get-or-create', ChatController.getOrCreateChat);
router.get('/:chatId/messages', ChatController.getChatMessages);
router.get('/', ChatController.getMyChats);

export default router;
