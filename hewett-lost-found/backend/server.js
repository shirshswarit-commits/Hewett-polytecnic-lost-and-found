import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.routes.js';
import itemRoutes from './src/routes/items.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';

dotenv.config();

const app = express();

// ============ MIDDLEWARES ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ ROUTES ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hewett Lost & Found API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/upload', uploadRoutes);

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ============ SERVER START ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});