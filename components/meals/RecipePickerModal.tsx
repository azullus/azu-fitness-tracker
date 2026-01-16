'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, Clock, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchRecipesByCategory, fetchAllRecipes, type RecipeCategory } from '@/lib/recipe-loader';
import { getUserRecipes } from '@/lib/user-recipes';
import type { Recipe } from '@/lib/types';
import type { MealSlotType } from '@/lib/meal-plan';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: {
    id: string;
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) => void;
  mealType?: MealSlotType;
}

const categoryLabels: Record<RecipeCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function RecipePickerModal({ isOpen, onClose, onSelect, mealType }: RecipePickerModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>(
    mealType || 'all'
  );

  // Load recipes
  useEffect(() => {
    if (!isOpen) return;

    const loadRecipes = async () => {
      setLoading(true);
      try {
        // Load built-in recipes
        let builtInRecipes: Recipe[];
        if (selectedCategory === 'all') {
          builtInRecipes = await fetchAllRecipes();
        } else {
          builtInRecipes = await fetchRecipesByCategory(selectedCategory);
        }

        // Load user recipes
        const userRecipes = getUserRecipes();
        const filteredUserRecipes = selectedCategory === 'all'
          ? userRecipes
          : userRecipes.filter((r) => r.category === selectedCategory);

        // Combine and set
        setRecipes([...builtInRecipes, ...filteredUserRecipes]);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [isOpen, selectedCategory]);

  // Update category when mealType changes
  useEffect(() => {
    if (mealType) {
      setSelectedCategory(mealType);
    }
  }, [mealType]);

  // Filter recipes by search
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    const query = searchQuery.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }, [recipes, searchQuery]);

  const handleSelect = (recipe: Recipe) => {
    onSelect({
      id: recipe.id,
      name: recipe.name,
      calories: recipe.macrosPerServing?.calories,
      protein: recipe.macrosPerServing?.protein,
      carbs: recipe.macrosPerServing?.carbs,
      fat: recipe.macrosPerServing?.fat,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Recipe
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                selectedCategory === 'all'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              All
            </button>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as RecipeCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  selectedCategory === cat
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No recipes found</p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => handleSelect(recipe)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {recipe.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {recipe.macrosPerServing?.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {recipe.macrosPerServing.calories} cal
                        </span>
                      )}
                      {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                        </span>
                      )}
                      {recipe.macrosPerServing?.protein && (
                        <span>{recipe.macrosPerServing.protein}g protein</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                    {recipe.category}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipePickerModal;
