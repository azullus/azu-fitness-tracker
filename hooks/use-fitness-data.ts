'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Workout, WeightEntry, Meal, Person } from '@/lib/types';

// API base URL
const API_BASE = '/api';

// Query key factories for consistent cache key management
export const queryKeys = {
  all: ['fitness'] as const,
  workouts: (personId?: string) => [...queryKeys.all, 'workouts', personId] as const,
  weightEntries: (personId?: string) => [...queryKeys.all, 'weight', personId] as const,
  meals: (date?: string, personId?: string) => [...queryKeys.all, 'meals', date, personId] as const,
  persons: () => [...queryKeys.all, 'persons'] as const,
  recipes: (category?: string) => [...queryKeys.all, 'recipes', category] as const,
};

// Generic fetch helper with error handling
async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }
  const data = await response.json();
  return data.data || data;
}

/**
 * Hook to fetch workouts for a person
 */
export function useWorkouts(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts(personId),
    queryFn: () => fetchApi<Workout[]>(`${API_BASE}/workouts?person_id=${personId}`),
    enabled: !!personId,
    // Workouts change frequently during a session
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch weight entries for a person
 */
export function useWeightEntries(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weightEntries(personId),
    queryFn: () => fetchApi<WeightEntry[]>(`${API_BASE}/weight?person_id=${personId}`),
    enabled: !!personId,
    // Weight entries don't change as frequently
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch meals for a specific date
 */
export function useMeals(date: string | undefined, personId?: string) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (personId) params.set('person_id', personId);

  return useQuery({
    queryKey: queryKeys.meals(date, personId),
    queryFn: () => fetchApi<Meal[]>(`${API_BASE}/meals?${params.toString()}`),
    enabled: !!date,
    // Meals change during the day
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch all persons
 */
export function usePersons() {
  return useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => fetchApi<Person[]>(`${API_BASE}/persons`),
    // Persons rarely change
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: Partial<Workout>) => {
      const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create workout' }));
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate workouts for this person to trigger refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.workouts(variables.person_id),
      });
    },
  });
}

/**
 * Hook to log a weight entry
 */
export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Partial<WeightEntry>) => {
      const response = await fetch(`${API_BASE}/weight`, {
        method: 'PUT', // Uses upsert endpoint
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to log weight' }));
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate weight entries for this person
      queryClient.invalidateQueries({
        queryKey: queryKeys.weightEntries(variables.person_id),
      });
    },
  });
}

/**
 * Hook to log a meal
 */
export function useLogMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meal: Partial<Meal>) => {
      const response = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to log meal' }));
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate meals for this date
      queryClient.invalidateQueries({
        queryKey: queryKeys.meals(variables.date, variables.person_id),
      });
    },
  });
}

/**
 * Hook to invalidate all fitness data (useful after sync or major changes)
 */
export function useInvalidateAllFitnessData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
  };
}

/**
 * Hook to prefetch data for better UX
 */
export function usePrefetchFitnessData(personId: string | undefined) {
  const queryClient = useQueryClient();

  return {
    prefetchWorkouts: () => {
      if (personId) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.workouts(personId),
          queryFn: () => fetchApi<Workout[]>(`${API_BASE}/workouts?person_id=${personId}`),
        });
      }
    },
    prefetchWeightEntries: () => {
      if (personId) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.weightEntries(personId),
          queryFn: () => fetchApi<WeightEntry[]>(`${API_BASE}/weight?person_id=${personId}`),
        });
      }
    },
  };
}
