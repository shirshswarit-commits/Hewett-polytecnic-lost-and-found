import { supabase, supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ============================================
// SIGNUP — Naya user banao
// ============================================
export const signup = async (req, res) => {
  try {
    const { email, password, full_name, phone, roll_number, branch } = req.body;

    // 1. Validation
    if (!email || !password || !full_name) {
      return sendError(res, 'Email, password, and full name are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    // 2. Supabase auth mein user banao
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for dev
    });

    if (authError) {
      return sendError(res, authError.message, 400);
    }

    const userId = authData.user.id;

    // 3. Profiles table mein entry banao
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name,
        phone: phone || null,
        roll_number: roll_number || null,
        branch: branch || null,
      });

    if (profileError) {
      // Rollback: user delete karo
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return sendError(res, profileError.message, 400);
    }

    // 4. Success response
    return sendSuccess(
      res,
      { user: { id: userId, email, full_name } },
      'User registered successfully',
      201
    );
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    return sendError(res, 'Signup failed', 500);
  }
};

// ============================================
// LOGIN — User ko login karao, token do
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // 2. Supabase se login karo
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // 3. Profile fetch karo
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // 4. Success response
    return sendSuccess(
      res,
      {
        user: profile || data.user,
        token: data.session.access_token,
      },
      'Login successful',
      200
    );
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return sendError(res, 'Login failed', 500);
  }
};

// ============================================
// GET PROFILE — Apni profile dekho (protected)
// ============================================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return sendError(res, 'Profile not found', 404);
    }

    return sendSuccess(res, { user: profile }, 'Profile fetched successfully', 200);
  } catch (err) {
    console.error('❌ Get profile error:', err.message);
    return sendError(res, 'Failed to fetch profile', 500);
  }
};