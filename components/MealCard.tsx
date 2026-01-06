'use client';

import Link from 'next/link';
import { Utensils, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recipe {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prep_time_minutes?: number;
}

interface Meal {
  recipe: Recipe;
  notes?: string;
}

interface MealCardProps {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  meal?: Meal | null;
}

const mealIcons: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export default function MealCard({ mealType, meal }: MealCardProps) {
  if (!meal || !meal.recipe) {
    return (
      <div className="card bg-gray-50 text-center py-6">
        <span className="text-2xl">{mealIcons[mealType]}</span>
        <p className="font-medium text-gray-500 mt-2">{mealType}</p>
        <p className="text-sm text-gray-400">No meal planned</p>
      </div>
    );
  }

  const { recipe } = meal;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{mealIcons[mealType]}</span>
          <span className="text-sm font-medium text-gray-500">{mealType}</span>
        </div>
        {recipe.prep_time_minutes && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {recipe.prep_time_minutes}m
          </div>
        )}
      </div>

      <Link href={`/recipes/${recipe.id}`} className="block group">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {recipe.name}
        </h3>
      </Link>

      <div className="flex items-center gap-4 mt-3 text-sm">
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-medium">{recipe.calories}</span>
          <span className="text-gray-400">cal</span>
        </div>
        <div>
          <span className="font-medium text-blue-600">{recipe.protein_g}g</span>
          <span className="text-gray-400 ml-1">protein</span>
        </div>
      </div>

      {meal.notes && (
        <p className="mt-2 text-sm text-gray-500 italic">{meal.notes}</p>
      )}
    </div>
  );
}
