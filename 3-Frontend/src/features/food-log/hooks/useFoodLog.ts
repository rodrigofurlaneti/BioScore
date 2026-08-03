import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodLogApi } from '../api/foodLogApi';
import { useAuthStore } from '../../../core/auth/authStore';
import type { AddLogItemRequest, DailyLog } from '../types/foodLog.types';

export const FOOD_LOG_KEYS = {
  today: ['food-log', 'today'] as const,
  items: (search?: string) => ['food-items', search] as const,
};

export function useTodayLog() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: FOOD_LOG_KEYS.today,
    queryFn: foodLogApi.getTodayLog,
    enabled: isAuthenticated,
  });
}

export function useFoodItems(search?: string) {
  return useQuery({
    queryKey: FOOD_LOG_KEYS.items(search),
    queryFn: () => foodLogApi.getFoodItems(search),
  });
}

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (file: File) => foodLogApi.analyzePhoto(file),
  });
}

export function useFoodLogHistory() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery<DailyLog[]>({
    queryKey: ['food-log', 'history'],
    queryFn: foodLogApi.getHistory,
    enabled: isAuthenticated,
  });
}

export function useAddLogItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddLogItemRequest) => {
      const log = await foodLogApi.ensureTodayLog();
      return foodLogApi.addItem(log.id, data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FOOD_LOG_KEYS.today });
    },
  });
}
