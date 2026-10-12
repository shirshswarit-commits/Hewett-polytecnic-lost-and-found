import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
} from '../controllers/items.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (login zaroori nahi)
// ============================================
router.get('/', getAllItems);

// ============================================
// PROTECTED ROUTES (login zaroori — specific routes pehle!)
// ============================================
router.get('/my', authMiddleware, getMyItems);       // ← /:id se PEHLE hona chahiye
router.post('/', authMiddleware, createItem);

// ============================================
// DYNAMIC ROUTES (id wale — sabse last mein)
// ============================================
router.get('/:id', getItemById);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;