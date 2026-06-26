import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from localStorage ────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: unwrap data, surface errors ────────────────────────
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // If 401, token is invalid/expired — clear it and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default client;
