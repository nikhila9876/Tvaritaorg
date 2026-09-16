import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── Request interceptor: attach auth token ─────────────────────── */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tvarita_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response interceptor: normalize errors ─────────────────────── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tvarita_token');
      localStorage.removeItem('tvarita_user');
      // Redirect to login without hard reload if possible
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normalize any list response to always be an array.
 * API can return: [] | { data: [] } | { artists: [] } etc.
 */
export function normalizeList(response, key = null) {
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (key && Array.isArray(d?.[key])) return d[key];
  // Try common wrapper keys
  for (const k of ['data', 'items', 'results', 'records', 'list']) {
    if (Array.isArray(d?.[k])) return d[k];
  }
  if (Array.isArray(d?.data?.items)) return d.data.items;
  return [];
}

/**
 * Normalize a single-item response.
 */
export function normalizeItem(response, key = null) {
  const d = response?.data;
  if (key && d?.[key]) return d[key];
  if (d?.data && typeof d.data === 'object') return d.data;
  return d;
}

export default apiClient;
