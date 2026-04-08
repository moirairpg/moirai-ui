const apiFetch = (url, options = {}) =>
  fetch(url, { ...options, credentials: 'include' });

export { apiFetch };

export const api = {
  auth: {
    discordAuthorizeUrl: () => apiFetch('/api/auth/discord/authorize-url'),
    user: () => apiFetch('/api/auth/user'),
    refresh: () => apiFetch('/api/auth/refresh', { method: 'POST' }),
    logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  },

  projects: () => apiFetch('/api/projects'),
  sessions: (projectName, limit = 5, offset = 0) =>
    apiFetch(`/api/projects/${projectName}/sessions?limit=${limit}&offset=${offset}`),
  unifiedSessionMessages: (sessionId, provider = 'claude', { projectName = '', projectPath = '', limit = null, offset = 0 } = {}) => {
    const params = new URLSearchParams();
    params.append('provider', provider);
    if (projectName) params.append('projectName', projectName);
    if (projectPath) params.append('projectPath', projectPath);
    if (limit !== null) {
      params.append('limit', String(limit));
      params.append('offset', String(offset));
    }
    const queryString = params.toString();
    return apiFetch(`/api/sessions/${encodeURIComponent(sessionId)}/messages${queryString ? `?${queryString}` : ''}`);
  },
  renameProject: (projectName, displayName) =>
    apiFetch(`/api/projects/${projectName}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    }),
  deleteSession: (projectName, sessionId) =>
    apiFetch(`/api/projects/${projectName}/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
  renameSession: (sessionId, summary, provider) =>
    apiFetch(`/api/sessions/${sessionId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ summary, provider }),
    }),
  deleteCodexSession: (sessionId) =>
    apiFetch(`/api/codex/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
  deleteGeminiSession: (sessionId) =>
    apiFetch(`/api/gemini/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
  deleteProject: (projectName, force = false) =>
    apiFetch(`/api/projects/${projectName}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
    }),
  searchConversationsUrl: (query, limit = 50) => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return `/api/search/conversations?${params.toString()}`;
  },
  createProject: (path) =>
    apiFetch('/api/projects/create', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }),
  createWorkspace: (workspaceData) =>
    apiFetch('/api/projects/create-workspace', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    }),
  readFile: (projectName, filePath) =>
    apiFetch(`/api/projects/${projectName}/file?filePath=${encodeURIComponent(filePath)}`),
  saveFile: (projectName, filePath, content) =>
    apiFetch(`/api/projects/${projectName}/file`, {
      method: 'PUT',
      body: JSON.stringify({ filePath, content }),
    }),
  getFiles: (projectName, options = {}) =>
    apiFetch(`/api/projects/${projectName}/files`, options),

  createFile: (projectName, { path, type, name }) =>
    apiFetch(`/api/projects/${projectName}/files/create`, {
      method: 'POST',
      body: JSON.stringify({ path, type, name }),
    }),

  renameFile: (projectName, { oldPath, newName }) =>
    apiFetch(`/api/projects/${projectName}/files/rename`, {
      method: 'PUT',
      body: JSON.stringify({ oldPath, newName }),
    }),

  deleteFile: (projectName, { path, type }) =>
    apiFetch(`/api/projects/${projectName}/files`, {
      method: 'DELETE',
      body: JSON.stringify({ path, type }),
    }),

  uploadFiles: (projectName, formData) =>
    apiFetch(`/api/projects/${projectName}/files/upload`, {
      method: 'POST',
      body: formData,
    }),

  transcribe: (formData) =>
    apiFetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    }),

  taskmaster: {
    init: (projectName) =>
      apiFetch(`/api/taskmaster/init/${projectName}`, {
        method: 'POST',
      }),

    addTask: (projectName, { prompt, title, description, priority, dependencies }) =>
      apiFetch(`/api/taskmaster/add-task/${projectName}`, {
        method: 'POST',
        body: JSON.stringify({ prompt, title, description, priority, dependencies }),
      }),

    parsePRD: (projectName, { fileName, numTasks, append }) =>
      apiFetch(`/api/taskmaster/parse-prd/${projectName}`, {
        method: 'POST',
        body: JSON.stringify({ fileName, numTasks, append }),
      }),

    getTemplates: () =>
      apiFetch('/api/taskmaster/prd-templates'),

    applyTemplate: (projectName, { templateId, fileName, customizations }) =>
      apiFetch(`/api/taskmaster/apply-template/${projectName}`, {
        method: 'POST',
        body: JSON.stringify({ templateId, fileName, customizations }),
      }),

    updateTask: (projectName, taskId, updates) =>
      apiFetch(`/api/taskmaster/update-task/${projectName}/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  browseFilesystem: (dirPath = null) => {
    const params = new URLSearchParams();
    if (dirPath) params.append('path', dirPath);

    return apiFetch(`/api/browse-filesystem?${params}`);
  },

  createFolder: (folderPath) =>
    apiFetch('/api/create-folder', {
      method: 'POST',
      body: JSON.stringify({ path: folderPath }),
    }),

  user: {
    gitConfig: () => apiFetch('/api/user/git-config'),
    updateGitConfig: (gitName, gitEmail) =>
      apiFetch('/api/user/git-config', {
        method: 'POST',
        body: JSON.stringify({ gitName, gitEmail }),
      }),
    onboardingStatus: () => apiFetch('/api/user/onboarding-status'),
    completeOnboarding: () =>
      apiFetch('/api/user/complete-onboarding', {
        method: 'POST',
      }),
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
