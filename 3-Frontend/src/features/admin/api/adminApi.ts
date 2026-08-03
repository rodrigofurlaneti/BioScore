import { apiClient } from '../../../core/api/client';
import type {
  FoodCategory, CreateFoodCategoryPayload, UpdateFoodCategoryPayload,
  FoodItem, CreateFoodItemPayload, UpdateFoodItemPayload,
  ExamCategory, CreateExamCategoryPayload, UpdateExamCategoryPayload,
  Exam, CreateExamPayload, UpdateExamPayload,
} from '../types/admin.types';

// ─── Food Categories ────────────────────────────────────────────────────────
export const foodCategoriesApi = {
  getAll: () => apiClient.get<FoodCategory[]>('/food-categories').then(r => r.data),
  getById: (id: string) => apiClient.get<FoodCategory>(`/food-categories/${id}`).then(r => r.data),
  create: (data: CreateFoodCategoryPayload) => apiClient.post<string>('/food-categories', data).then(r => r.data),
  update: (data: UpdateFoodCategoryPayload) => apiClient.put(`/food-categories/${data.id}`, data),
  delete: (id: string) => apiClient.delete(`/food-categories/${id}`),
};

// ─── Food Items ─────────────────────────────────────────────────────────────
export const foodItemsApi = {
  getAll: () => apiClient.get<FoodItem[]>('/food-items').then(r => r.data),
  getById: (id: string) => apiClient.get<FoodItem>(`/food-items/${id}`).then(r => r.data),
  create: (data: CreateFoodItemPayload) => apiClient.post<string>('/food-items', data).then(r => r.data),
  update: (data: UpdateFoodItemPayload) => apiClient.put(`/food-items/${data.id}`, data),
  delete: (id: string) => apiClient.delete(`/food-items/${id}`),
};

// ─── Exam Categories ────────────────────────────────────────────────────────
export const examCategoriesApi = {
  getAll: () => apiClient.get<ExamCategory[]>('/exam-categories').then(r => r.data),
  getById: (id: string) => apiClient.get<ExamCategory>(`/exam-categories/${id}`).then(r => r.data),
  create: (data: CreateExamCategoryPayload) => apiClient.post<string>('/exam-categories', data).then(r => r.data),
  update: (data: UpdateExamCategoryPayload) => apiClient.put(`/exam-categories/${data.id}`, data),
  delete: (id: string) => apiClient.delete(`/exam-categories/${id}`),
};

// ─── Exams ──────────────────────────────────────────────────────────────────
export const examsAdminApi = {
  getAll: () => apiClient.get<Exam[]>('/exams').then(r => r.data),
  getById: (id: string) => apiClient.get<Exam>(`/exams/${id}`).then(r => r.data),
  create: (data: CreateExamPayload) => apiClient.post<string>('/exams', data).then(r => r.data),
  update: (data: UpdateExamPayload) => apiClient.put(`/exams/${data.id}`, data),
  delete: (id: string) => apiClient.delete(`/exams/${id}`),
};
