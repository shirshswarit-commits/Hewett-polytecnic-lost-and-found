import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

const getThreadForParticipant = async (threadId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .or(`owner_id.eq.${userId},participant_id.eq.${userId}`)
    .maybeSingle();

  return { thread: data, error };
};

export const startItemChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('id, user_id')
      .eq('id', itemId)
      .maybeSingle();

    if (itemError) return sendError(res, itemError.message, 400);
    if (!item) return sendError(res, 'Item not found', 404);
    if (item.user_id === userId) {
      return sendError(res, 'You cannot start a chat with yourself', 400);
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('chat_threads')
      .select('*')
      .eq('item_id', item.id)
      .eq('participant_id', userId)
      .maybeSingle();

    if (lookupError) return sendError(res, lookupError.message, 400);
    if (existing) return sendSuccess(res, { thread: existing }, 'Chat opened', 200);

    const { data: thread, error } = await supabaseAdmin
      .from('chat_threads')
      .insert({
        item_id: item.id,
        owner_id: item.user_id,
        participant_id: userId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: createdByOtherRequest, error: retryError } = await supabaseAdmin
          .from('chat_threads')
          .select('*')
          .eq('item_id', item.id)
          .eq('participant_id', userId)
          .single();
        if (retryError) return sendError(res, retryError.message, 400);
        return sendSuccess(res, { thread: createdByOtherRequest }, 'Chat opened', 200);
      }
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, { thread }, 'Chat opened', 201);
  } catch (err) {
    console.error('❌ Start chat error:', err.message);
    return sendError(res, 'Could not start this chat', 500);
  }
};

export const getMyThreads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: threads, error } = await supabaseAdmin
      .from('chat_threads')
      .select('*')
      .or(`owner_id.eq.${userId},participant_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) return sendError(res, error.message, 400);
    if (!threads.length) {
      return sendSuccess(res, { threads: [] }, 'Chats fetched', 200);
    }

    const itemIds = [...new Set(threads.map(({ item_id: itemId }) => itemId))];
    const userIds = [...new Set(threads.flatMap(({ owner_id: ownerId, participant_id: participantId }) => [ownerId, participantId]))];
    const threadIds = threads.map(({ id }) => id);
    const [
      { data: items, error: itemsError },
      { data: profiles, error: profilesError },
      { data: messages, error: messagesError },
    ] = await Promise.all([
      supabaseAdmin.from('items').select('id, title, type, image_urls').in('id', itemIds),
      supabaseAdmin.from('profiles').select('id, full_name').in('id', userIds),
      supabaseAdmin
        .from('chat_messages')
        .select('thread_id, body, created_at, sender_id')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    if (itemsError || profilesError || messagesError) {
      return sendError(res, itemsError?.message || profilesError?.message || messagesError?.message, 400);
    }

    const itemById = new Map(items.map((item) => [item.id, item]));
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    const latestMessageByThread = new Map();
    for (const message of messages) {
      if (!latestMessageByThread.has(message.thread_id)) {
        latestMessageByThread.set(message.thread_id, message);
      }
    }

    const result = threads
      .filter(({ item_id: itemId }) => itemById.has(itemId))
      .map((thread) => {
        const otherUserId = thread.owner_id === userId ? thread.participant_id : thread.owner_id;
        return {
          ...thread,
          item: itemById.get(thread.item_id),
          other_user: profileById.get(otherUserId) || { id: otherUserId, full_name: 'Campus member' },
          last_message: latestMessageByThread.get(thread.id) || null,
        };
      });

    return sendSuccess(res, { threads: result }, 'Chats fetched', 200);
  } catch (err) {
    console.error('❌ Get chats error:', err.message);
    return sendError(res, 'Could not fetch your chats', 500);
  }
};

export const getThreadMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { thread, error: threadError } = await getThreadForParticipant(threadId, req.user.id);
    if (threadError) return sendError(res, threadError.message, 400);
    if (!thread) return sendError(res, 'Chat not found', 404);

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return sendError(res, error.message, 400);
    return sendSuccess(res, { messages: messages.reverse() }, 'Messages fetched', 200);
  } catch (err) {
    console.error('❌ Get messages error:', err.message);
    return sendError(res, 'Could not fetch messages', 500);
  }
};

export const sendThreadMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { thread, error: threadError } = await getThreadForParticipant(threadId, req.user.id);
    if (threadError) return sendError(res, threadError.message, 400);
    if (!thread) return sendError(res, 'Chat not found', 404);

    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    const location = req.body.location;
    if (!body && !location) return sendError(res, 'Write a message or attach your location', 400);
    if (body.length > 2000) return sendError(res, 'Messages must be 2,000 characters or fewer', 400);

    let safeLocation = null;
    if (location !== undefined && location !== null) {
      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);
      const label = typeof location.label === 'string' ? location.label.trim().slice(0, 200) : '';
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
        || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return sendError(res, 'A valid location is required', 400);
      }
      safeLocation = { latitude, longitude, label };
    }

    const { data: message, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        thread_id: thread.id,
        sender_id: req.user.id,
        body,
        location: safeLocation,
      })
      .select()
      .single();

    if (error) return sendError(res, error.message, 400);

    const { error: updateError } = await supabaseAdmin
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', thread.id);

    if (updateError) {
      console.error('❌ Update chat timestamp error:', updateError.message);
    }

    return sendSuccess(res, { message }, 'Message sent', 201);
  } catch (err) {
    console.error('❌ Send message error:', err.message);
    return sendError(res, 'Could not send this message', 500);
  }
};
