import express from 'express' 
import { ChatController } from '../controllers/chatContoller';

const router = express.Router()

router.post('/get-or-create', ChatController.getOrCreateChat)
router.get('/:chatId/messages', ChatController.getChatMessages)
router.get('/', ChatController.getMyChats)

export default router;