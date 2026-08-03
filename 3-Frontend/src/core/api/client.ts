import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:7001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 90_000, // 90s para suportar análise de foto via Gemini (~15s)
});

/** Inject Bearer token on every request */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** On 401 → clear auth and redirect to login */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);
