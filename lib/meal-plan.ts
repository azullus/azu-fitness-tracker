// Meal Plan Storage Utilities
// Handles weekly meal planning with localStorage persistence

import { startOfWeek, format, addDays, parseISO } from 'date-fns';

const MEAL_PLAN_KEY = 'fitness-tracker-meal-plan';

export type MealSlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
  date: string; // ISO date string (yyyy-MM-dd)
  mealType: MealSlotType;
  recipeId: string;
  recipeName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface WeeklyMealPlan {
  weekStart: string; // ISO date of Monday
  personId: string;
  meals: PlannedMeal[];
  updatedAt: string;
}

// Get the Monday of the week containing the given date
export function getWeekStart(date: Date = new Date()): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

// Get all dates in a week starting from Monday
export function getWeekDates(weekStart: string): string[] {
  const monday = parseISO(weekStart);
  return Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'));
}

// Get the storage key for a specific person
function getStorageKey(personId: string): string {
  return `${MEAL_PLAN_KEY}-${personId}`;
}

// Load all meal plans for a person
function loadMealPlans(personId: string): WeeklyMealPlan[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(getStorageKey(personId));
    if (!stored) return [];
    return JSON.parse(stored) as WeeklyMealPlan[];
  } catch {
    return [];
  }
}

// Save all meal plans for a person
function saveMealPlans(personId: string, plans: WeeklyMealPlan[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getStorageKey(personId), JSON.stringify(plans));
  } catch {
    console.error('Failed to save meal plans to localStorage');
  }
}

// Get meal plan for a specific week
export function getMealPlanForWeek(personId: string, weekStart: string): WeeklyMealPlan | null {
  const plans = loadMealPlans(personId);
  return plans.find(p => p.weekStart === weekStart) || null;
}

// Get all planned meals for a specific week
export function getPlannedMealsForWeek(personId: string, weekStart: string): PlannedMeal[] {
  const plan = getMealPlanForWeek(personId, weekStart);
  return plan?.meals || [];
}

// Get planned meal for a specific slot
export function getPlannedMeal(
  personId: string,
  date: string,
  mealType: MealSlotType
): PlannedMeal | null {
  const weekStart = getWeekStart(parseISO(date));
  const meals = getPlannedMealsForWeek(personId, weekStart);
  return meals.find(m => m.date === date && m.mealType === mealType) || null;
}

// Set a meal in a specific slot
export function setPlannedMeal(
  personId: string,
  meal: PlannedMeal
): void {
  const weekStart = getWeekStart(parseISO(meal.date));
  const plans = loadMealPlans(personId);

  // Find or create the week's plan
  let weekPlan = plans.find(p => p.weekStart === weekStart);
  if (!weekPlan) {
    weekPlan = {
      weekStart,
      personId,
      meals: [],
      updatedAt: new Date().toISOString(),
    };
    plans.push(weekPlan);
  }

  // Remove existing meal in same slot
  weekPlan.meals = weekPlan.meals.filter(
    m => !(m.date === meal.date && m.mealType === meal.mealType)
  );

  // Add the new meal
  weekPlan.meals.push(meal);
  weekPlan.updatedAt = new Date().toISOString();

  saveMealPlans(personId, plans);
}

// Remove a meal from a specific slot
export function removePlannedMeal(
  personId: string,
  date: string,
  mealType: MealSlotType
): void {
  const weekStart = getWeekStart(parseISO(date));
  const plans = loadMealPlans(personId);

  const weekPlan = plans.find(p => p.weekStart === weekStart);
  if (!weekPlan) return;

  weekPlan.meals = weekPlan.meals.filter(
    m => !(m.date === date && m.mealType === mealType)
  );
  weekPlan.updatedAt = new Date().toISOString();

  saveMealPlans(personId, plans);
}

// Clear all meals for a specific week
export function clearWeekMealPlan(personId: string, weekStart: string): void {
  const plans = loadMealPlans(personId);
  const filtered = plans.filter(p => p.weekStart !== weekStart);
  saveMealPlans(personId, filtered);
}

// Copy meals from one week to another
export function copyWeekMealPlan(
  personId: string,
  sourceWeekStart: string,
  targetWeekStart: string
): void {
  const sourcePlan = getMealPlanForWeek(personId, sourceWeekStart);
  if (!sourcePlan || sourcePlan.meals.length === 0) return;

  const sourceDates = getWeekDates(sourceWeekStart);
  const targetDates = getWeekDates(targetWeekStart);

  // Map source dates to target dates
  const copiedMeals: PlannedMeal[] = sourcePlan.meals.map(meal => {
    const dayIndex = sourceDates.indexOf(meal.date);
    return {
      ...meal,
      date: targetDates[dayIndex] || meal.date,
    };
  });

  const plans = loadMealPlans(personId);

  // Remove existing target week plan
  const filteredPlans = plans.filter(p => p.weekStart !== targetWeekStart);

  // Add copied plan
  filteredPlans.push({
    weekStart: targetWeekStart,
    personId,
    meals: copiedMeals,
    updatedAt: new Date().toISOString(),
  });

  saveMealPlans(personId, filteredPlans);
}

// Get unique recipes used in a week's meal plan
export function getRecipeIdsForWeek(personId: string, weekStart: string): string[] {
  const meals = getPlannedMealsForWeek(personId, weekStart);
  const uniqueIds = new Set(meals.map(m => m.recipeId));
  return Array.from(uniqueIds);
}
