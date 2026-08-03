import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/auth/authStore';
import type {
  ExamRequest, CreateExamRequestPayload, UpdateExamItemPayload,
} from '../types/exams.types';

export const examsApi = {
  // GET /api/exam-categories (not /exams/categories)
  getCategories: () =>
    apiClient.get('/exam-categories').then(r => r.data),

  // GET /api/exams
  getExams: () =>
    apiClient.get('/exams').then(r => r.data),

  // GET /api/exam-requests?userId=... (not /exam-requests/me)
  getMyRequests: () => {
    const userId = useAuthStore.getState().user?.id;
    return apiClient
      .get<ExamRequest[]>('/exam-requests', { params: { userId } })
      .then(r => r.data);
  },

  createRequest: (data: CreateExamRequestPayload) => {
    const userId = useAuthStore.getState().user?.id;
    return apiClient
      .post<{ id: string }>('/exam-requests', { ...data, userId, requestDate: new Date().toISOString().split('T')[0] })
      .then(r => r.data);
  },

  // PATCH /api/exam-requests/{requestId}/items/{itemId}/complete
  completeItem: (requestId: string, itemId: string, data: UpdateExamItemPayload) =>
    apiClient
      .patch(`/exam-requests/${requestId}/items/${itemId}/complete`, data)
      .then(r => r.data),
};
