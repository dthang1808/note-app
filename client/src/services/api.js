const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    let result = {};
    try {
      result = await response.json();
    } catch {
      // Use a generic message when the server response is not JSON.
    }
    const error = new Error(result.error || 'Không thể kết nối với máy chủ.');
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

async function submitCredentials(path, credentials) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

export const authApi = {
  async me() {
    try {
      const result = await request('/api/auth/me');
      return result.user;
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  },
  async login(credentials) {
    const result = await submitCredentials('/api/auth/login', credentials);
    return result.user;
  },
  async register(credentials) {
    const result = await submitCredentials('/api/auth/register', credentials);
    return result.user;
  },
  logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },
};

export const notesApi = {
  getAll() {
    return request('/api/notes');
  },
  create(values) {
    return request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  },
  update(id, values) {
    return request(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  },
  remove(id) {
    return request(`/api/notes/${id}`, { method: 'DELETE' });
  },
};
