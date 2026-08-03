import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './core/queryClient';
import { AppRouter } from './core/router/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
