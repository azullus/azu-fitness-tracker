'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider wraps the application with React Query's QueryClientProvider
 *
 * This enables:
 * - Automatic request deduplication (multiple components can use the same query)
 * - Smart caching with stale-while-revalidate pattern
 * - Background refetching when data becomes stale
 * - Optimistic updates for mutations
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
