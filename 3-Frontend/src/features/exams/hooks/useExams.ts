import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '../api/examsApi';
import { useAuthStore } from '../../../core/auth/authStore';
import type { CreateExamRequestPayload, UpdateExamItemPayload } from '../types/exams.types';

const KEYS = {
  categories: ['exam-categories'] as const,
  all:        ['exams', 'all']    as const,
  requests:   (userId?: string) => ['exam-requests', userId] as const,
};

export function useExamCategories() {
  return useQuery({ queryKey: KEYS.categories, queryFn: examsApi.getCategories });
}

export function useAllExams() {
  return useQuery({ queryKey: KEYS.all, queryFn: examsApi.getExams });
}

export function useMyExamRequests() {
  const userId = useAuthStore(s => s.user?.id);
  return useQuery({
    queryKey: KEYS.requests(userId),
    queryFn: examsApi.getMyRequests,
    enabled: !!userId,
  });
}

export function useCreateExamRequest() {
  const userId = useAuthStore(s => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamRequestPayload) => examsApi.createRequest(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.requests(userId) }),
  });
}

export function useUpdateExamItem() {
  const userId = useAuthStore(s => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, itemId, data }: { requestId: string; itemId: string; data: UpdateExamItemPayload }) =>
      examsApi.completeItem(requestId, itemId, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.requests(userId) }),
  });
}
