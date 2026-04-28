import { QueryClient } from '@tanstack/react-query';

export const BUK_EMPLEADOS_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: BUK_EMPLEADOS_STALE_TIME_MS,
      gcTime: BUK_EMPLEADOS_STALE_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});