import express from 'express';
import { startChat, getThreads, getMessages, sendMessage } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/items/:itemId', authMiddleware, startChat);
router.get('/threads', authMiddleware, getThreads);
router.get('/threads/:threadId/messages', authMiddleware, getMessages);
router.post('/threads/:threadId/messages', authMiddleware, sendMessage);

export default router;