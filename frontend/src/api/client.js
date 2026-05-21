/**
 * API client. Backend URL comes from VITE_API_BASE_URL env var,
 * falling back to localhost for development.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getRooms: () => request('/api/rooms'),
  book: (count) =>
    request('/api/book', { method: 'POST', body: JSON.stringify({ count }) }),
  random: (fillRatio) =>
    request('/api/random', {
      method: 'POST',
      body: JSON.stringify({ fillRatio }),
    }),
  reset: () => request('/api/reset', { method: 'POST' }),
};
