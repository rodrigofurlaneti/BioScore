import { apiClient } from '../../../core/api/client';
import type { User, UpdateUserPayload } from '../types/users.types';

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users').then(r => r.data),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`).then(r => r.data),
  update: (data: UpdateUserPayload) => apiClient.put(`/users/${data.id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
