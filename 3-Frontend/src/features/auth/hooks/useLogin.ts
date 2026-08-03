import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../../../core/auth/authStore';
import type { LoginRequest } from '../types/auth.types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate(from, { replace: true });
    },
  });
}
