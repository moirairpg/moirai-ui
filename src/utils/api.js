const apiFetch = (url, options = {}) =>
  fetch(url, { ...options, credentials: 'include' });

export { apiFetch };

export const extractApiError = async (res) => {
  try {
    const data = await res.json();
    const parts = [];
    if (data.message) parts.push(data.message);
    if (Array.isArray(data.details) && data.details.length > 0) parts.push(data.details.join(', '));
    return parts.length > 0 ? parts.join(' — ') : null;
  } catch {
    return null;
  }
};

export const api = {
  auth: {
    user: () => apiFetch('/api/auth/user'),
    refresh: () => apiFetch('/api/auth/refresh', { method: 'POST' }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  },
  imageGenerations: {
    generate: async (prompt) => {
      const res = await apiFetch('/api/image-generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Image generation failed');
      return res.blob();
    },
  },
  world: {
    uploadImage: (id, file) => {
      const form = new FormData();
      form.append('file', file);
      return apiFetch(`/api/world/${id}/image`, { method: 'PUT', body: form });
    },
    removeImage: (id) =>
      apiFetch(`/api/world/${id}/image`, { method: 'DELETE' }),
  },
  adventure: {
    uploadImage: (id, file) => {
      const form = new FormData();
      form.append('file', file);
      return apiFetch(`/api/adventure/${id}/image`, { method: 'PUT', body: form });
    },
    removeImage: (id) =>
      apiFetch(`/api/adventure/${id}/image`, { method: 'DELETE' }),
  },
};
