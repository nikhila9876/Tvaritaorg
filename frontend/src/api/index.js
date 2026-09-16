import apiClient, { normalizeList, normalizeItem } from './client';

/* ─── Auth ────────────────────────────────────────────────────────── */
export const auth = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  sendOtp: (data) => apiClient.post('/auth/send-otp', data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  resendOtp: (data) => apiClient.post('/auth/resend-otp', data),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

/* ─── Artists ────────────────────────────────────────────────────── */
export const artists = {
  list: (params) => apiClient.get('/artists', { params }),
  get: (id) => apiClient.get(`/artists/${id}`),
  me: () => apiClient.get('/artists/me'),
  update: (id, data) => apiClient.put(`/artists/${id}`, data),
  uploadMedia: (id, formData) => apiClient.post(`/artists/${id}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteMedia: (id, mediaId) => apiClient.delete(`/artists/${id}/media/${mediaId}`),
  getAvailability: (id) => apiClient.get(`/artists/${id}/availability`),
  updateAvailability: (id, data) => apiClient.put(`/artists/${id}/availability`, data),
  getEarnings: (id, params) => apiClient.get(`/artists/${id}/earnings`, { params }),
};

/* ─── Art Forms ──────────────────────────────────────────────────── */
export const artForms = {
  list: (params) => apiClient.get('/art-forms', { params }),
  get: (id) => apiClient.get(`/art-forms/${id}`),
  create: (data) => apiClient.post('/art-forms', data),
  update: (id, data) => apiClient.put(`/art-forms/${id}`, data),
  delete: (id) => apiClient.delete(`/art-forms/${id}`),
};

/* ─── Events ──────────────────────────────────────────────────────── */
export const events = {
  list: (params) => apiClient.get('/events', { params }),
  get: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  register: (id, data) => apiClient.post(`/events/${id}/register`, data),
  book: (id, data) => apiClient.post(`/events/${id}/book`, data),
};

/* ─── Bookings ────────────────────────────────────────────────────── */
export const bookings = {
  list: (params) => apiClient.get('/bookings', { params }),
  get: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  updateStatus: (id, data) => apiClient.put(`/bookings/${id}/status`, data),
  cancel: (id) => apiClient.put(`/bookings/${id}/status`, { status: 'cancelled' }),
};

/* ─── Products / Marketplace ─────────────────────────────────────── */
export const products = {
  list: (params) => apiClient.get('/products', { params }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

export const cart = {
  get: () => apiClient.get('/cart'),
  add: (data) => apiClient.post('/cart', data),
  update: (itemId, data) => apiClient.put(`/cart/${itemId}`, data),
  remove: (itemId) => apiClient.delete(`/cart/${itemId}`),
  clear: () => apiClient.delete('/cart'),
};

export const orders = {
  list: (params) => apiClient.get('/orders', { params }),
  get: (id) => apiClient.get(`/orders/${id}`),
};

/* ─── Payments ────────────────────────────────────────────────────── */
export const payments = {
  createOrder: (data) => apiClient.post('/payments/create-order', data),
  verify: (data) => apiClient.post('/payments/verify', data),
  status: (orderId) => apiClient.get(`/payments/status/${orderId}`),
};

/* ─── Knowledge ──────────────────────────────────────────────────── */
export const knowledge = {
  list: (params) => apiClient.get('/knowledge', { params }),
  get: (id) => apiClient.get(`/knowledge/${id}`),
  create: (formData) => apiClient.post('/knowledge', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => apiClient.put(`/knowledge/${id}`, data),
  delete: (id) => apiClient.delete(`/knowledge/${id}`),
};

/* ─── Community ──────────────────────────────────────────────────── */
export const community = {
  follow: (artistId) => apiClient.post('/community/follow', { artistId }),
  unfollow: (artistId) => apiClient.delete(`/community/follow/${artistId}`),
  save: (contentId, contentType) => apiClient.post('/community/save', { contentId, contentType }),
  unsave: (contentId) => apiClient.delete(`/community/save/${contentId}`),
  notifications: (params) => apiClient.get('/notifications', { params }),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
};

/* ─── Impact ──────────────────────────────────────────────────────── */
export const impact = {
  dashboard: (params) => apiClient.get('/impact', { params }),
  program: (id) => apiClient.get(`/impact/program/${id}`),
  report: (params) => apiClient.get('/impact/report', { params }),
  addEvidence: (programId, formData) => apiClient.post(`/impact/program/${programId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

/* ─── Admin ───────────────────────────────────────────────────────── */
export const admin = {
  dashboard: () => apiClient.get('/admin/dashboard'),
  users: (params) => apiClient.get('/admin/users', { params }),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  approvals: (params) => apiClient.get('/admin/approvals', { params }),
  processApproval: (id, data) => apiClient.put(`/admin/approvals/${id}`, data),
  content: (params) => apiClient.get('/admin/content', { params }),
  updateContent: (id, data) => apiClient.put(`/admin/content/${id}`, data),
  settings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
};

/* ─── Search ──────────────────────────────────────────────────────── */
export const search = {
  global: (q, params) => apiClient.get('/search', { params: { q, ...params } }),
};

/* ─── Re-export normalizers for convenience ──────────────────────── */
export { normalizeList, normalizeItem };
