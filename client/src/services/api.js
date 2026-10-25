const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let result = {};
    try {
      result = await response.json();
    } catch {
      // Use a generic message when the server response is not JSON.
    }
    throw new Error(result.error || 'Không thể kết nối với máy chủ.');
  }

  return response.status === 204 ? null : response.json();
}

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
