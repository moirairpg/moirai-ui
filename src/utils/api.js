const apiFetch = (url, options = {}) =>
  fetch(url, { ...options, credentials: 'include' });

export { apiFetch };

export const api = {
  auth: {
    user: () => apiFetch('/api/auth/user'),
    refresh: () => apiFetch('/api/auth/refresh', { method: 'POST' }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  },
};
