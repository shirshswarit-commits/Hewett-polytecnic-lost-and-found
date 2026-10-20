import express from 'express';
import {
  getMyThreads,
  getThreadMessages,
  sendThreadMessage,
  startItemChat,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/threads', getMyThreads);
router.post('/items/:itemId', startItemChat);
router.get('/threads/:threadId/messages', getThreadMessages);
router.post('/threads/:threadId/messages', sendThreadMessage);

export default router;
