import { QueryClient } from '@tanstack/react-query';
import React from 'react';

export function retry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (status === 404 || status === 422) return false;
  }
  return true;
}

export default function useQueryClientConfig() {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15000,
        retry,
        refetchOnWindowFocus: false,
      },
    },
  }));
  return queryClient;
}
