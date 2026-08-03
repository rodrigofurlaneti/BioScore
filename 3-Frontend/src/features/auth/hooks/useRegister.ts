import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../../../core/auth/authStore';
import type { RegisterRequest } from '../types/auth.types';

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    },
  });
}
