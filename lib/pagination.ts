/**
 * Pagination utilities for API endpoints
 * Provides consistent pagination across all list endpoints
 */

import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Default pagination settings
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;

/**
 * Extract pagination parameters from request URL
 * Supports: ?page=1&limit=50
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);

  // Parse page (default: 1, min: 1)
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10);
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  // Parse limit (default: 50, max: 100)
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  // Calculate offset for database queries
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create a paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };
}

/**
 * Apply pagination to an in-memory array
 * Useful for demo data or SQLite results that don't support OFFSET
 */
export function paginateArray<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const total = items.length;
  const paginatedItems = items.slice(params.offset, params.offset + params.limit);

  return createPaginatedResponse(paginatedItems, total, params);
}
