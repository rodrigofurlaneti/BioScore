import { apiClient } from '../../../core/api/client';

export interface DashboardSummary {
  todayPoints: number;
  dailyLimit: number;
  todayItemCount: number;
  pendingExams: number;
  recentLogs: Array<{ logDate: string; totalPoints: number }>;
}

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<DashboardSummary>('/users/me/summary').then((r) => r.data),
};
