import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const DASHBOARD_KEY = ['dashboard', 'summary'] as const;

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: dashboardApi.getSummary,
  });
}
