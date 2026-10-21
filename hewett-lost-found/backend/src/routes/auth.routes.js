import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (login zaroori nahi)
// ============================================
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ============================================
// PROTECTED ROUTES (login zaroori hai)
// ============================================
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);

export default router;