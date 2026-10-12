import express from 'express';
import { signup, login, getProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (login zaroori nahi)
// ============================================
router.post('/signup', signup);
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (login zaroori hai)
// ============================================
router.get('/profile', authMiddleware, getProfile);

export default router;