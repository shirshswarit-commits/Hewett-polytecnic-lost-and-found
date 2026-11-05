import express from 'express';
import multer from 'multer';
import { uploadImages, uploadProfilePhoto } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 3,                   // Max 3 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
    }
  },
});

// ============================================
// ROUTES
// ============================================

// Items ke liye multiple images
router.post('/', authMiddleware, upload.array('images', 3), uploadImages);

// Profile ke liye single image (Frontend se 'avatar' key bhejni hogi)
router.post('/profile', authMiddleware, upload.single('avatar'), uploadProfilePhoto);

export default router;