import { QueryClient } from '@tanstack/react-query';

/**
 * Create a QueryClient instance with optimized default options
 *
 * Stale time: How long data is considered fresh (no refetch)
 * GC time: How long inactive data stays in cache before garbage collection
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 1 minute by default
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests up to 3 times with exponential backoff
        retry: 3,
        // Don't refetch on window focus for better UX (can be overridden per query)
        refetchOnWindowFocus: false,
        // Refetch when reconnecting to the internet
        refetchOnReconnect: true,
      },
    },
  });
}

// Singleton for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is important to avoid re-creating the client on every render
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
