export const TOAST_EVENT = 'app-toast';
export const SESSION_ENDED_EVENT = 'session-ended';
export const SESSION_RENEWED_EVENT = 'session-renewed';

const HTTP_UNAUTHORIZED = 401;
const SESSION_RENEWED_HEADER = 'X-Session-Renewed';

const endSession = () => {
  window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT));
};

export const notifyError = (message) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message: message ?? null, variant: 'error' } }));
};

export const notifySuccess = (message) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, variant: 'success' } }));
};

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

const isSilenced = (silent, res) => (typeof silent === 'function' ? silent(res) : silent);

const apiFetch = async (url, options = {}) => {
  const { silent = false, ...init } = options;

  try {
    const res = await fetch(url, { ...init, credentials: 'include' });

    if (res.headers.get(SESSION_RENEWED_HEADER)) {
      window.dispatchEvent(new CustomEvent(SESSION_RENEWED_EVENT));
    }

    if (res.status === HTTP_UNAUTHORIZED) {
      endSession();
      return res;
    }

    if (!res.ok && !isSilenced(silent, res)) {
      notifyError(await extractApiError(res.clone()));
    }

    return res;
  } catch (error) {
    if (silent !== true) notifyError(null);
    throw error;
  }
};

export { apiFetch };

export const api = {
  auth: {
    user: () => apiFetch('/api/auth/user', { silent: true }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST', silent: true }),
    signUpDetails: () => apiFetch('/api/auth/signup/details', { silent: true }),
    signUp: (input) =>
      apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
  },
  imageGenerations: {
    generate: async (prompt, options = {}) => {
      const res = await apiFetch('/api/image-generations', {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Image generation failed');
      return res.blob();
    },
  },
  world: {
    uploadImage: (id, file, options = {}) => {
      const form = new FormData();
      form.append('file', file);
      return apiFetch(`/api/worlds/${id}/image`, { ...options, method: 'PUT', body: form });
    },
    removeImage: (id) =>
      apiFetch(`/api/worlds/${id}/image`, { method: 'DELETE' }),
  },
  adventure: {
    uploadImage: (id, file, options = {}) => {
      const form = new FormData();
      form.append('file', file);
      return apiFetch(`/api/adventures/${id}/image`, { ...options, method: 'PUT', body: form });
    },
    removeImage: (id) =>
      apiFetch(`/api/adventures/${id}/image`, { method: 'DELETE' }),
    invite: (adventureId, usernames, options = {}) =>
      apiFetch(`/api/adventures/${adventureId}/invitations`, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames }),
      }),
    removeCharacter: (adventureId, playerCharacterId, options = {}) =>
      apiFetch(`/api/adventures/${adventureId}/characters/${playerCharacterId}`, { ...options, method: 'DELETE' }),
  },
  adventureInvitations: {
    join: (invitationId, playerCharacterId) =>
      apiFetch(`/api/adventures/invitations/${invitationId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerCharacterId }),
      }),
    decline: (invitationId) =>
      apiFetch(`/api/adventures/invitations/${invitationId}/decline`, { method: 'POST' }),
  },
  character: {
    search: (name) =>
      apiFetch(`/api/player-characters/search?name=${encodeURIComponent(name ?? '')}`),
    uploadImage: (id, file, options = {}) => {
      const form = new FormData();
      form.append('file', file);
      return apiFetch(`/api/player-characters/${id}/image`, { ...options, method: 'PUT', body: form });
    },
    removeImage: (id) =>
      apiFetch(`/api/player-characters/${id}/image`, { method: 'DELETE' }),
  },
  assetPermissions: {
    list: (assetKind, assetId) => apiFetch(`/api/${assetKind}/${assetId}/permissions`),
    save: (assetKind, assetId, visibility, members, options = {}) =>
      apiFetch(`/api/${assetKind}/${assetId}/permissions`, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility, members }),
      }),
  },
};
