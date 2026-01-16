'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, addWeeks, subWeeks, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Copy, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useCurrentPerson } from '@/components/providers/PersonProvider';
import {
  getWeekStart,
  getWeekDates,
  getPlannedMealsForWeek,
  setPlannedMeal,
  removePlannedMeal,
  clearWeekMealPlan,
  copyWeekMealPlan,
  type MealSlotType,
  type PlannedMeal,
} from '@/lib/meal-plan';
import { RecipePickerModal } from './RecipePickerModal';

const mealTypes: MealSlotType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const mealTypeLabels: Record<MealSlotType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const mealTypeEmojis: Record<MealSlotType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MealSlotProps {
  date: string;
  mealType: MealSlotType;
  meal: PlannedMeal | null;
  onAdd: () => void;
  onRemove: () => void;
  isCompact?: boolean;
}

function MealSlot({ date, mealType, meal, onAdd, onRemove, isCompact }: MealSlotProps) {
  const dateIsToday = isToday(parseISO(date));

  if (meal) {
    return (
      <div
        className={clsx(
          'relative group rounded-lg p-1.5 cursor-pointer transition-all',
          'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800',
          'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
          isCompact ? 'h-12' : 'h-14'
        )}
        onClick={onAdd}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <X className="w-3 h-3" />
        </button>
        <p className={clsx(
          'font-medium text-emerald-800 dark:text-emerald-200 truncate',
          isCompact ? 'text-[10px]' : 'text-xs'
        )}>
          {meal.recipeName}
        </p>
        {meal.calories && !isCompact && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {meal.calories} cal
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onAdd}
      className={clsx(
        'w-full rounded-lg border-2 border-dashed transition-all flex items-center justify-center',
        'border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600',
        'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        dateIsToday && 'border-emerald-300 dark:border-emerald-700',
        isCompact ? 'h-12' : 'h-14'
      )}
    >
      <Plus className={clsx(
        'text-gray-400 dark:text-gray-600 group-hover:text-emerald-500',
        isCompact ? 'w-3 h-3' : 'w-4 h-4'
      )} />
    </button>
  );
}

export function MealsWeekView() {
  const currentPerson = useCurrentPerson();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [refreshKey, setRefreshKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: MealSlotType } | null>(null);

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  const plannedMeals = useMemo(() => {
    if (!currentPerson) return [];
    return getPlannedMealsForWeek(currentPerson.id, currentWeekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPerson, currentWeekStart, refreshKey]);

  const getMealForSlot = useCallback(
    (date: string, mealType: MealSlotType): PlannedMeal | null => {
      return plannedMeals.find((m) => m.date === date && m.mealType === mealType) || null;
    },
    [plannedMeals]
  );

  const handlePreviousWeek = () => {
    const prevWeek = subWeeks(parseISO(currentWeekStart), 1);
    setCurrentWeekStart(getWeekStart(prevWeek));
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(parseISO(currentWeekStart), 1);
    setCurrentWeekStart(getWeekStart(nextWeek));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleOpenPicker = (date: string, mealType: MealSlotType) => {
    setSelectedSlot({ date, mealType });
    setPickerOpen(true);
  };

  const handleSelectRecipe = (recipe: { id: string; name: string; calories?: number; protein?: number; carbs?: number; fat?: number }) => {
    if (!currentPerson || !selectedSlot) return;

    setPlannedMeal(currentPerson.id, {
      date: selectedSlot.date,
      mealType: selectedSlot.mealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    });

    setRefreshKey((k) => k + 1);
    setPickerOpen(false);
    setSelectedSlot(null);
  };

  const handleRemoveMeal = (date: string, mealType: MealSlotType) => {
    if (!currentPerson) return;
    removePlannedMeal(currentPerson.id, date, mealType);
    setRefreshKey((k) => k + 1);
  };

  const handleClearWeek = () => {
    if (!currentPerson) return;
    if (confirm('Clear all meals for this week?')) {
      clearWeekMealPlan(currentPerson.id, currentWeekStart);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleCopyFromLastWeek = () => {
    if (!currentPerson) return;
    const lastWeek = getWeekStart(subWeeks(parseISO(currentWeekStart), 1));
    copyWeekMealPlan(currentPerson.id, lastWeek, currentWeekStart);
    setRefreshKey((k) => k + 1);
  };

  // Calculate weekly totals
  const weeklyTotals = useMemo(() => {
    return plannedMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        meals: totals.meals + 1,
      }),
      { calories: 0, meals: 0 }
    );
  }, [plannedMeals]);

  const weekLabel = useMemo(() => {
    const start = parseISO(weekDates[0]);
    const end = parseISO(weekDates[6]);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }, [weekDates]);

  const isCurrentWeek = currentWeekStart === getWeekStart(new Date());

  if (!currentPerson) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Select a person to plan meals</p>
      </div>
    );
  }

  return (
    <>
      {/* Week Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-900 dark:text-white">{weekLabel}</span>
            {!isCurrentWeek && (
              <button
                onClick={handleThisWeek}
                className="mt-1 px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
              >
                This Week
              </button>
            )}
          </div>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-3 flex gap-2">
        <button
          onClick={handleCopyFromLastWeek}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Last Week
        </button>
        <button
          onClick={handleClearWeek}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Weekly Summary */}
      <div className="px-4 pt-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{weeklyTotals.meals}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Meals Planned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {weeklyTotals.meals > 0 ? Math.round(weeklyTotals.calories / 7) : 0}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Avg Cal/Day</p>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="px-4 py-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDates.map((date, idx) => {
            const dateObj = parseISO(date);
            const isDateToday = isToday(dateObj);
            return (
              <div
                key={date}
                className={clsx(
                  'text-center py-1.5 rounded-lg',
                  isDateToday && 'bg-emerald-100 dark:bg-emerald-900/40'
                )}
              >
                <p className={clsx(
                  'text-[10px] font-medium',
                  isDateToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {dayLabels[idx]}
                </p>
                <p className={clsx(
                  'text-sm font-semibold',
                  isDateToday ? 'text-emerald-800 dark:text-emerald-200' : 'text-gray-900 dark:text-white'
                )}>
                  {format(dateObj, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Meal Rows */}
        {mealTypes.map((mealType) => (
          <div key={mealType} className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">{mealTypeEmojis[mealType]}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {mealTypeLabels[mealType]}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((date) => (
                <MealSlot
                  key={`${date}-${mealType}`}
                  date={date}
                  mealType={mealType}
                  meal={getMealForSlot(date, mealType)}
                  onAdd={() => handleOpenPicker(date, mealType)}
                  onRemove={() => handleRemoveMeal(date, mealType)}
                  isCompact
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Picker Modal */}
      <RecipePickerModal
        isOpen={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setSelectedSlot(null);
        }}
        onSelect={handleSelectRecipe}
        mealType={selectedSlot?.mealType}
      />
    </>
  );
}

export default MealsWeekView;
