import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ============================================
// 1. CHAT START KARO
// ============================================
export const startChat = async (req, res) => {
  try {
    const { itemId } = req.params;
    const starterId = req.user.id;

    // Check karo item exist karta hai ya nahi aur uska owner kaun hai
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) return sendError(res, 'Item not found', 404);
    if (item.user_id === starterId) return sendError(res, 'You cannot chat with yourself', 400);

    // Check karo thread pehle se hai ya nahi
    let { data: thread } = await supabaseAdmin
      .from('chat_threads')
      .select('*')
      .eq('item_id', itemId)
      .eq('starter_id', starterId)
      .eq('receiver_id', item.user_id)
      .maybeSingle(); // maybeSingle use kiya taaki error na aaye agar nahi mile

    // Agar nahi hai toh naya banao
    if (!thread) {
      const { data: newThread, error: createError } = await supabaseAdmin
        .from('chat_threads')
        .insert({ item_id: itemId, starter_id: starterId, receiver_id: item.user_id })
        .select()
        .single();
      
      if (createError) return sendError(res, createError.message, 400);
      thread = newThread;
    }

    return sendSuccess(res, { thread }, 'Chat started', 200);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ============================================
// 2. SAARE THREADS DEKHO (INBOX)
// ============================================
export const getThreads = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch threads with item and profile details
    const { data: threads, error } = await supabaseAdmin
      .from('chat_threads')
      .select(`
        id,
        created_at,
        item:items(id, title, type, image_urls),
        starter:profiles!starter_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url)
      `)
      .or(`starter_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, error.message, 400);

    // Frontend ke hisaab se data format karo (other_user aur last_message)
    const formattedThreads = await Promise.all(threads.map(async (thread) => {
      const isStarter = thread.starter.id === userId;
      const other_user = isStarter ? thread.receiver : thread.starter;

      // Har thread ka last message fetch karo
      const { data: lastMessages } = await supabaseAdmin
        .from('chat_messages')
        .select('message, location, created_at')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const last_message = lastMessages && lastMessages.length > 0 
        ? { 
            body: lastMessages[0].message, 
            location: lastMessages[0].location, 
            created_at: lastMessages[0].created_at 
          }
        : null;

      return {
        id: thread.id,
        created_at: thread.created_at,
        item: thread.item,
        other_user: other_user,
        last_message: last_message
      };
    }));

    return sendSuccess(res, { threads: formattedThreads }, 'Threads fetched', 200);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ============================================
// 3. MESSAGES DEKHO
// ============================================
export const getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*, sender:profiles!sender_id(full_name, avatar_url)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) return sendError(res, error.message, 400);
    
    // Frontend 'body' expect kar raha hai, isliye map kar rahe hain
    const formattedMessages = data.map(msg => ({
      ...msg,
      body: msg.message, // Database ka 'message' frontend ke 'body' mein bhej do
    }));

    return sendSuccess(res, { messages: formattedMessages }, 'Messages fetched', 200);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ============================================
// 4. NAYA MESSAGE BHEJO
// ============================================
export const sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body, location } = req.body; // Frontend 'body' aur 'location' bhej raha hai
    const senderId = req.user.id;

    if (!body && !location) return sendError(res, 'Message or location is required', 400);

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({ 
        thread_id: threadId, 
        sender_id: senderId, 
        message: body || '', // Frontend ke 'body' ko DB ke 'message' mein save karo
        location: location || null 
      })
      .select('*, sender:profiles!sender_id(full_name, avatar_url)')
      .single();

    if (error) return sendError(res, error.message, 400);
    
    // Response mein bhi 'body' key bhej do
    const formattedMessage = {
      ...data,
      body: data.message,
    };

    return sendSuccess(res, { message: formattedMessage }, 'Message sent', 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};