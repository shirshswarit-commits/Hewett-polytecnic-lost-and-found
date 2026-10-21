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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return sendError(res, 'Email is required', 400);
    }

    const options = process.env.FRONTEND_URL
      ? { redirectTo: process.env.FRONTEND_URL }
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), options);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'If an account exists for that email, a password reset link has been sent.', 200);
  } catch (err) {
    console.error('❌ Password reset request error:', err.message);
    return sendError(res, 'Could not send a password reset link', 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return sendError(res, 'A recovery token and new password are required', 400);
    }
    if (password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters', 400);
    }

    const { data, error: tokenError } = await supabase.auth.getUser(token);
    if (tokenError || !data.user) {
      return sendError(res, 'This password reset link is invalid or has expired', 400);
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, { password });
    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Password updated. You can now sign in with your new password.', 200);
  } catch (err) {
    console.error('❌ Password reset error:', err.message);
    return sendError(res, 'Could not reset your password', 500);
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, roll_number, branch, avatar_url } = req.body;
    const updates = {};

    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length > 100) {
        return sendError(res, 'Full name must be between 1 and 100 characters', 400);
      }
      updates.full_name = full_name.trim();
    }

    for (const [field, value] of Object.entries({ phone, roll_number, branch })) {
      if (value !== undefined) {
        if (value !== null && (typeof value !== 'string' || value.trim().length > 120)) {
          return sendError(res, `${field} must be 120 characters or fewer`, 400);
        }
        updates[field] = value?.trim() || null;
      }
    }

    if (avatar_url !== undefined) {
      if (avatar_url !== null && (
        typeof avatar_url !== 'string'
        || avatar_url.length > 2048
        || !/^https?:\/\//i.test(avatar_url)
      )) {
        return sendError(res, 'Profile photo URL is invalid', 400);
      }
      updates.avatar_url = avatar_url;
    }

    if (!Object.keys(updates).length) {
      return sendError(res, 'No profile changes provided', 400);
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { user: profile }, 'Profile updated successfully', 200);
  } catch (err) {
    console.error('❌ Update profile error:', err.message);
    return sendError(res, 'Could not update your profile', 500);
  }
};