/**
 * HTTP Cache Header Utilities
 *
 * Provides consistent cache headers for API responses to improve performance.
 *
 * Cache Strategies:
 * - PRIVATE: User-specific data (meals, workouts, weight) - shorter cache
 * - PUBLIC: Shared data (recipes, exercises) - longer cache
 * - NO_CACHE: Always fetch fresh (auth, CSRF)
 */

export const CacheStrategies = {
  /**
   * For user-specific data that changes frequently
   * Cache for 60 seconds, allow stale for 30 more while revalidating
   */
  PRIVATE_SHORT: {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
  },

  /**
   * For user-specific data that changes less frequently
   * Cache for 5 minutes, allow stale for 1 minute while revalidating
   */
  PRIVATE_MEDIUM: {
    'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
  },

  /**
   * For shared/public data like recipes and exercises
   * Cache for 1 hour, allow stale for 5 minutes while revalidating
   */
  PUBLIC_LONG: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
  },

  /**
   * For data that should never be cached (auth, CSRF tokens)
   */
  NO_CACHE: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  },
} as const;

export type CacheStrategy = keyof typeof CacheStrategies;

/**
 * Get cache headers for a given strategy
 */
export function getCacheHeaders(strategy: CacheStrategy): Record<string, string> {
  return { ...CacheStrategies[strategy] };
}

/**
 * Add cache headers to an existing headers object
 */
export function withCacheHeaders(
  headers: Record<string, string>,
  strategy: CacheStrategy
): Record<string, string> {
  return {
    ...headers,
    ...CacheStrategies[strategy],
  };
}
