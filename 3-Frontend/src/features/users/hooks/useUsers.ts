import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { UpdateUserPayload } from '../types/users.types';

export const USERS_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersApi.getAll });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => usersApi.update(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
