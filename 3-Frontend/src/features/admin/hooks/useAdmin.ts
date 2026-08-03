import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodCategoriesApi, foodItemsApi, examCategoriesApi, examsAdminApi } from '../api/adminApi';
import type {
  CreateFoodCategoryPayload, UpdateFoodCategoryPayload,
  CreateFoodItemPayload, UpdateFoodItemPayload,
  CreateExamCategoryPayload, UpdateExamCategoryPayload,
  CreateExamPayload, UpdateExamPayload,
} from '../types/admin.types';

// ─── Food Categories ────────────────────────────────────────────────────────
export const FOOD_CAT_KEY = ['admin', 'food-categories'] as const;

export function useFoodCategories() {
  return useQuery({ queryKey: FOOD_CAT_KEY, queryFn: foodCategoriesApi.getAll });
}
export function useCreateFoodCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFoodCategoryPayload) => foodCategoriesApi.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_CAT_KEY }),
  });
}
export function useUpdateFoodCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFoodCategoryPayload) => foodCategoriesApi.update(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_CAT_KEY }),
  });
}
export function useDeleteFoodCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foodCategoriesApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_CAT_KEY }),
  });
}

// ─── Food Items ─────────────────────────────────────────────────────────────
export const FOOD_ITEMS_KEY = ['admin', 'food-items'] as const;

export function useFoodItemsAdmin() {
  return useQuery({ queryKey: FOOD_ITEMS_KEY, queryFn: foodItemsApi.getAll });
}
export function useCreateFoodItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFoodItemPayload) => foodItemsApi.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_ITEMS_KEY }),
  });
}
export function useUpdateFoodItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFoodItemPayload) => foodItemsApi.update(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_ITEMS_KEY }),
  });
}
export function useDeleteFoodItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foodItemsApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FOOD_ITEMS_KEY }),
  });
}

// ─── Exam Categories ────────────────────────────────────────────────────────
export const EXAM_CAT_KEY = ['admin', 'exam-categories'] as const;

export function useExamCategoriesAdmin() {
  return useQuery({ queryKey: EXAM_CAT_KEY, queryFn: examCategoriesApi.getAll });
}
export function useCreateExamCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamCategoryPayload) => examCategoriesApi.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAM_CAT_KEY }),
  });
}
export function useUpdateExamCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExamCategoryPayload) => examCategoriesApi.update(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAM_CAT_KEY }),
  });
}
export function useDeleteExamCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examCategoriesApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAM_CAT_KEY }),
  });
}

// ─── Exams ──────────────────────────────────────────────────────────────────
export const EXAMS_ADMIN_KEY = ['admin', 'exams'] as const;

export function useExamsAdmin() {
  return useQuery({ queryKey: EXAMS_ADMIN_KEY, queryFn: examsAdminApi.getAll });
}
export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamPayload) => examsAdminApi.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAMS_ADMIN_KEY }),
  });
}
export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExamPayload) => examsAdminApi.update(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAMS_ADMIN_KEY }),
  });
}
export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsAdminApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: EXAMS_ADMIN_KEY }),
  });
}
