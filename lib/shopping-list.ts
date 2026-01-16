// Shopping List Storage and Generation Utilities
// Auto-generates shopping lists from weekly meal plans

import { getWeekStart, getPlannedMealsForWeek, getRecipeIdsForWeek } from './meal-plan';
import { fetchRecipeById } from './recipe-loader';
import { generateShoppingList as generateFromRecipes } from './recipe-utils';
import type { Recipe, RecipeIngredient } from './types';

const SHOPPING_LIST_KEY = 'fitness-tracker-shopping-list';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  category?: string;
}

export interface ShoppingListData {
  weekStart: string;
  personId: string;
  generatedAt: string;
  items: ShoppingItem[];
}

// Ingredient category mapping for grouping
const ingredientCategories: Record<string, string> = {
  // Proteins
  chicken: 'Proteins',
  beef: 'Proteins',
  pork: 'Proteins',
  fish: 'Proteins',
  salmon: 'Proteins',
  tuna: 'Proteins',
  shrimp: 'Proteins',
  turkey: 'Proteins',
  bacon: 'Proteins',
  sausage: 'Proteins',
  eggs: 'Proteins',
  tofu: 'Proteins',

  // Dairy
  milk: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  butter: 'Dairy',
  cream: 'Dairy',
  sour: 'Dairy',

  // Produce
  lettuce: 'Produce',
  tomato: 'Produce',
  onion: 'Produce',
  garlic: 'Produce',
  pepper: 'Produce',
  carrot: 'Produce',
  celery: 'Produce',
  broccoli: 'Produce',
  spinach: 'Produce',
  kale: 'Produce',
  avocado: 'Produce',
  cucumber: 'Produce',
  zucchini: 'Produce',
  mushroom: 'Produce',
  potato: 'Produce',
  apple: 'Produce',
  banana: 'Produce',
  lemon: 'Produce',
  lime: 'Produce',
  orange: 'Produce',
  berry: 'Produce',
  strawberry: 'Produce',
  blueberry: 'Produce',

  // Grains
  rice: 'Grains',
  pasta: 'Grains',
  bread: 'Grains',
  flour: 'Grains',
  oats: 'Grains',
  quinoa: 'Grains',
  tortilla: 'Grains',
  noodle: 'Grains',

  // Pantry
  oil: 'Pantry',
  vinegar: 'Pantry',
  sauce: 'Pantry',
  broth: 'Pantry',
  stock: 'Pantry',
  sugar: 'Pantry',
  honey: 'Pantry',
  syrup: 'Pantry',
  salt: 'Pantry',
  spice: 'Pantry',
  herb: 'Pantry',

  // Canned
  beans: 'Canned',
  tomatoes: 'Canned',
  corn: 'Canned',
  coconut: 'Canned',
};

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [keyword, category] of Object.entries(ingredientCategories)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  return 'Other';
}

function getStorageKey(personId: string): string {
  return `${SHOPPING_LIST_KEY}-${personId}`;
}

// Load shopping list from localStorage
export function getShoppingList(personId: string): ShoppingListData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(getStorageKey(personId));
    if (!stored) return null;
    return JSON.parse(stored) as ShoppingListData;
  } catch {
    return null;
  }
}

// Save shopping list to localStorage
export function saveShoppingList(personId: string, data: ShoppingListData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getStorageKey(personId), JSON.stringify(data));
  } catch {
    console.error('Failed to save shopping list');
  }
}

// Generate shopping list from weekly meal plan
export async function generateShoppingListFromMealPlan(
  personId: string,
  weekStart?: string
): Promise<ShoppingListData> {
  const targetWeek = weekStart || getWeekStart(new Date());

  // Get recipe IDs from the meal plan
  const recipeIds = getRecipeIdsForWeek(personId, targetWeek);

  // Fetch full recipe data
  const recipes: Recipe[] = [];
  for (const id of recipeIds) {
    const recipe = await fetchRecipeById(id);
    if (recipe) {
      recipes.push(recipe);
    }
  }

  // Generate aggregated ingredient list
  const ingredients: RecipeIngredient[] = recipes.length > 0
    ? generateFromRecipes(recipes, 1) // Scale factor of 1 since recipes already have servings
    : [];

  // Convert to shopping items with categories
  const items: ShoppingItem[] = ingredients.map((ing, index) => ({
    id: `item-${index}-${Date.now()}`,
    name: ing.item,
    quantity: ing.quantity,
    unit: ing.unit,
    checked: false,
    category: categorizeIngredient(ing.item),
  }));

  // Sort by category then name
  items.sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '');
    }
    return a.name.localeCompare(b.name);
  });

  const data: ShoppingListData = {
    weekStart: targetWeek,
    personId,
    generatedAt: new Date().toISOString(),
    items,
  };

  // Save to localStorage
  saveShoppingList(personId, data);

  return data;
}

// Toggle item checked status
export function toggleShoppingItem(personId: string, itemId: string): void {
  const list = getShoppingList(personId);
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    saveShoppingList(personId, list);
  }
}

// Add custom item to shopping list
export function addShoppingItem(
  personId: string,
  item: Omit<ShoppingItem, 'id'>
): void {
  let list = getShoppingList(personId);

  if (!list) {
    list = {
      weekStart: getWeekStart(new Date()),
      personId,
      generatedAt: new Date().toISOString(),
      items: [],
    };
  }

  list.items.push({
    ...item,
    id: `custom-${Date.now()}`,
  });

  saveShoppingList(personId, list);
}

// Remove item from shopping list
export function removeShoppingItem(personId: string, itemId: string): void {
  const list = getShoppingList(personId);
  if (!list) return;

  list.items = list.items.filter((i) => i.id !== itemId);
  saveShoppingList(personId, list);
}

// Clear all checked items
export function clearCheckedItems(personId: string): void {
  const list = getShoppingList(personId);
  if (!list) return;

  list.items = list.items.filter((i) => !i.checked);
  saveShoppingList(personId, list);
}

// Get unchecked item count
export function getUncheckedCount(personId: string): number {
  const list = getShoppingList(personId);
  if (!list) return 0;
  return list.items.filter((i) => !i.checked).length;
}

// Clear entire shopping list
export function clearShoppingList(personId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getStorageKey(personId));
  } catch {
    // Ignore errors
  }
}
