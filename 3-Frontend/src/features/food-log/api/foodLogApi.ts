import { apiClient } from '../../../core/api/client';
import type { DailyLog, AddLogItemRequest, PhotoAnalysisResult } from '../types/foodLog.types';

const today = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

export const foodLogApi = {
  /** Get today's log for the current user (userId comes from JWT on backend). */
  getTodayLog: async (): Promise<DailyLog | null> => {
    try {
      return await apiClient
        .get<DailyLog>(`/daily-logs/${today()}`)
        .then(r => r.data);
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /** Create today's log if it doesn't exist yet. Returns the log. */
  ensureTodayLog: async (): Promise<DailyLog> => {
    const existing = await foodLogApi.getTodayLog();
    if (existing) return existing;

    await apiClient.post<{ id: string }>('/daily-logs', {
      logDate: today(),
      notes: null,
    });

    return await foodLogApi.getTodayLog() as DailyLog;
  },

  getHistory: async (): Promise<DailyLog[]> => {
    const to = today();
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return apiClient
      .get<DailyLog[]>('/daily-logs/history', { params: { from, to } })
      .then(r => r.data);
  },

  addItem: (logId: string, data: AddLogItemRequest) =>
    apiClient
      .post<{ id: string }>(`/daily-logs/${logId}/items`, data)
      .then(r => r.data),

  getFoodItems: (search?: string) =>
    apiClient
      .get('/food-items', { params: search ? { search } : undefined })
      .then(r => r.data),

  analyzePhoto: async (file: File): Promise<PhotoAnalysisResult> => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient
      .post<PhotoAnalysisResult>('/food-items/analyze-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },
};
