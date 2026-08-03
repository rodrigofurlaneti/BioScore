import { apiClient } from '../../../core/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),
};
