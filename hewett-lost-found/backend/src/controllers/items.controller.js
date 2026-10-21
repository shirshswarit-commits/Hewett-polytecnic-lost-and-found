import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ============================================
// CREATE ITEM — Naya lost/found item post karo
// ============================================
export const createItem = async (req, res) => {
  try {
    const userId = req.user.id;
const { type, title, description, category, location, date_lost_found, image_urls } = req.body;   

    // Validation
    if (!type || !title) {
      return sendError(res, 'Type and title are required', 400);
    }

    if (!['lost', 'found'].includes(type)) {
      return sendError(res, 'Type must be either "lost" or "found"', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('items')
      .insert({
        user_id: userId,
        type,
        title,
        description: description || null,
        category: category || null,
        location: location || null,
        date_lost_found: date_lost_found || null,
       image_urls: image_urls || [],
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { item: data }, 'Item posted successfully', 201);
  } catch (err) {
    console.error('❌ Create item error:', err.message);
    return sendError(res, 'Failed to create item', 500);
  }
};

// ============================================
// GET ALL ITEMS — Saare items (filter ke saath)
// ============================================
export const getAllItems = async (req, res) => {
  try {
    const { type, status, category, search } = req.query;

    let query = supabaseAdmin
      .from('items')
      .select('*, profiles(full_name, email, phone, branch)')
      .order('created_at', { ascending: false });

    // Filters
    if (type && ['lost', 'found'].includes(type)) {
      query = query.eq('type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { items: data, count: data.length }, 'Items fetched successfully', 200);
  } catch (err) {
    console.error('❌ Get items error:', err.message);
    return sendError(res, 'Failed to fetch items', 500);
  }
};

// ============================================
// GET ITEM BY ID — Ek specific item
// ============================================
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('items')
      .select('*, profiles(full_name, email, phone, branch)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return sendError(res, 'Item not found', 404);
    }

    return sendSuccess(res, { item: data }, 'Item fetched successfully', 200);
  } catch (err) {
    console.error('❌ Get item error:', err.message);
    return sendError(res, 'Failed to fetch item', 500);
  }
};

// ============================================
// UPDATE ITEM — Apna item update karo
// ============================================
export const updateItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, category, location, date_lost_found, image_urls, status } = req.body;

    // Check karo item tumhara hai
    const { data: existing } = await supabaseAdmin
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return sendError(res, 'Item not found', 404);
    }

    if (existing.user_id !== userId) {
      return sendError(res, 'You can only update your own items', 403);
    }

    // Updates object banao
    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (location !== undefined) updates.location = location;
    if (date_lost_found !== undefined) updates.date_lost_found = date_lost_found;
    if (image_urls !== undefined) updates.image_urls = image_urls;
    if (status && ['open', 'claimed', 'resolved'].includes(status)) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { item: data }, 'Item updated successfully', 200);
  } catch (err) {
    console.error('❌ Update item error:', err.message);
    return sendError(res, 'Failed to update item', 500);
  }
};

// ============================================
// DELETE ITEM — Apna item delete karo
// ============================================
export const deleteItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (lookupError) {
      return sendError(res, lookupError.code === 'PGRST116' ? 'Item not found' : lookupError.message, lookupError.code === 'PGRST116' ? 404 : 400);
    }
    if (!existing) {
      return sendError(res, 'Item not found', 404);
    }

    let isAdmin = ['admin', 'administrator'].includes(
      String(req.user.app_metadata?.role || '').toLowerCase(),
    );

    if (!isAdmin) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        return sendError(res, profileError.message, 400);
      }
      isAdmin = profile?.is_admin === true
        || profile?.isAdmin === true
        || ['admin', 'administrator'].includes(String(profile?.role || '').toLowerCase());
    }

    if (existing.user_id !== userId && !isAdmin) {
      return sendError(res, 'You can only delete your own items', 403);
    }

    const { error } = await supabaseAdmin
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Item deleted successfully', 200);
  } catch (err) {
    console.error('❌ Delete item error:', err.message);
    return sendError(res, 'Failed to delete item', 500);
  }
};

// ============================================
// GET MY ITEMS — Apne saare items
// ============================================
export const getMyItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { items: data, count: data.length }, 'Your items fetched successfully', 200);
  } catch (err) {
    console.error('❌ Get my items error:', err.message);
    return sendError(res, 'Failed to fetch your items', 500);
  }
};