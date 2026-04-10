const apiFetch = (url, options = {}) =>
  fetch(url, { ...options, credentials: 'include' });

export { apiFetch };

export const api = {
  auth: {
    user: () => apiFetch('/api/auth/user'),
    refresh: () => apiFetch('/api/auth/refresh', { method: 'POST' }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  },

  adventures: {
    list: (view, params = {}) => {
      const query = new URLSearchParams({ view, ...params }).toString();
      return apiFetch(`/api/adventure?${query}`);
    },
    get: (id) => apiFetch(`/api/adventure/${id}`),
    messages: (id) => apiFetch(`/api/adventure/${id}/messages`),
  },

  worlds: {
    list: () => apiFetch('/api/world'),
    get: (id) => apiFetch(`/api/world/${id}`),
  },

  personas: {
    list: () => apiFetch('/api/persona'),
    get: (id) => apiFetch(`/api/persona/${id}`),
  },

  get: (endpoint) => apiFetch(`/api${endpoint}`),

  post: (endpoint, body) => apiFetch(`/api${endpoint}`, {
    method: 'POST',
    ...(body instanceof FormData ? { body } : { body: JSON.stringify(body) }),
  }),

  put: (endpoint, body) => apiFetch(`/api${endpoint}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  delete: (endpoint, options = {}) => apiFetch(`/api${endpoint}`, {
    method: 'DELETE',
    ...options,
  }),
};
