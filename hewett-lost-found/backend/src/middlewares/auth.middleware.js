import { supabase } from '../config/supabase.js';
import { sendError } from '../utils/response.js';

// ============================================
// AUTH MIDDLEWARE — JWT verify karta hai
// ============================================
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Header se token nikalo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided. Please login.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Supabase se token verify karo
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 'Invalid or expired token. Please login again.', 401);
    }

    // 3. User info request pe attach karo (controllers use karenge)
    req.user = user;
    req.token = token;

    // 4. Aage badho
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);
    return sendError(res, 'Authentication failed', 401);
  }
};