const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  return result.data;
};

export const fetchItems = async () => {
  const data = await request("/items");
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      image_url: item.image_urls?.[0] || "",
    })),
  };
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
    item: {
      ...data.item,
      image_url: data.item.image_urls?.[0] || "",
    },
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
