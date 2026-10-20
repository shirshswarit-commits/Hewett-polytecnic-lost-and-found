const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? "http://localhost:5000/api" : "/api"
);

const request = async (path, { token, ...options } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    const message = result.message || `Request failed (${response.status}).`;
    if (path.startsWith("/chat/") && /chat_threads|chat_messages|schema cache/i.test(message)) {
      throw new Error(
        "Chat tables are not set up in Supabase yet. Run backend/supabase/migrations/20261020_item_chat.sql in the Supabase SQL Editor, then retry.",
      );
    }
    throw new Error(message);
  }

  return result.data;
};

export const fetchItems = async () => {
  const data = await request("/items");
  return {
    ...data,
    items: data.items.map(normalizeItem),
  };
};

export const fetchItem = async (id) => {
  const data = await request(`/items/${encodeURIComponent(id)}`);
  return { ...data, item: normalizeItem(data.item) };
};

const normalizeItem = (item) => ({
  ...item,
  image_url: item.image_urls?.[0] || item.image_url || "",
});

export const fetchMyItems = async (token) => {
  const data = await request("/items/my", { token });
  return { ...data, items: data.items.map(normalizeItem) };
};

export const uploadItemImages = async (files, token) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Image upload failed (${response.status}).`);
  }

  return result.data.image_urls;
};

export const createItem = async (item, token) => {
  const data = await request("/items", {
    method: "POST",
    token,
    body: JSON.stringify({
      type: item.type,
      title: item.title,
      description: item.description || null,
      category: item.category || null,
      location: item.location || null,
      date_lost_found: item.date_lost_found || null,
      image_urls: item.image_urls || [],
    }),
  });
  return {
    ...data,
    item: normalizeItem(data.item),
  };
};

export const loginUser = (email, password) => request("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

export const signupUser = (user) => request("/auth/signup", {
  method: "POST",
  body: JSON.stringify(user),
});

export const requestPasswordReset = (email) => request("/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email }),
});

export const resetPassword = (token, password) => request("/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({ token, password }),
});

export const fetchProfile = (token) => request("/auth/profile", { token });

export const updateProfile = (profile, token) => request("/auth/profile", {
  method: "PATCH",
  token,
  body: JSON.stringify(profile),
});

export const deleteItem = (id, token) => request(`/items/${encodeURIComponent(id)}`, {
  method: "DELETE",
  token,
});

export const startItemChat = (itemId, token) => request(`/chat/items/${encodeURIComponent(itemId)}`, {
  method: "POST",
  token,
});

export const fetchChatThreads = (token) => request("/chat/threads", { token });

export const fetchChatMessages = (threadId, token) => request(
  `/chat/threads/${encodeURIComponent(threadId)}/messages`,
  { token },
);

export const sendChatMessage = (threadId, message, token) => request(
  `/chat/threads/${encodeURIComponent(threadId)}/messages`,
  {
    method: "POST",
    token,
    body: JSON.stringify(message),
  },
);
