'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, RefreshCw, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useCurrentPerson } from '@/components/providers/PersonProvider';
import {
  getShoppingList,
  toggleShoppingItem,
  generateShoppingListFromMealPlan,
  clearCheckedItems,
  type ShoppingListData,
  type ShoppingItem,
} from '@/lib/shopping-list';
import { getWeekStart } from '@/lib/meal-plan';

export function ShoppingList() {
  const currentPerson = useCurrentPerson();
  const [list, setList] = useState<ShoppingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load shopping list
  useEffect(() => {
    if (!currentPerson) {
      setList(null);
      return;
    }

    const loadedList = getShoppingList(currentPerson.id);
    setList(loadedList);
  }, [currentPerson, refreshKey]);

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    if (!currentPerson) return;

    setLoading(true);
    try {
      const newList = await generateShoppingListFromMealPlan(currentPerson.id);
      setList(newList);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  }, [currentPerson]);

  // Handle toggle item
  const handleToggle = useCallback(
    (itemId: string) => {
      if (!currentPerson) return;
      toggleShoppingItem(currentPerson.id, itemId);
      setRefreshKey((k) => k + 1);
    },
    [currentPerson]
  );

  // Handle clear checked
  const handleClearChecked = useCallback(() => {
    if (!currentPerson) return;
    clearCheckedItems(currentPerson.id);
    setRefreshKey((k) => k + 1);
  }, [currentPerson]);

  // Get display items
  const uncheckedItems = list?.items.filter((i) => !i.checked) || [];
  const checkedItems = list?.items.filter((i) => i.checked) || [];
  const displayItems = expanded ? uncheckedItems : uncheckedItems.slice(0, 5);
  const hasMoreItems = uncheckedItems.length > 5;

  // Group items by category
  const groupedItems = displayItems.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Empty state - show generate button
  if (!list || (list.items.length === 0 && !loading)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Shopping List</h2>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Plan your meals for the week to auto-generate a shopping list.
        </p>
        <div className="flex gap-2">
          <Link
            href="/meals"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
          >
            Plan Meals
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            Generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Shopping List</h2>
          {uncheckedItems.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
              {uncheckedItems.length}
            </span>
          )}
        </div>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Regenerate from meal plan"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Items list */}
      {uncheckedItems.length === 0 ? (
        <div className="text-center py-4">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">All items checked off!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                {category}
              </p>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div
                      className={clsx(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        item.checked
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {item.checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={clsx(
                        'flex-1 text-sm',
                        item.checked
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-700 dark:text-gray-200'
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expand/Collapse */}
      {hasMoreItems && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 mt-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show {uncheckedItems.length - 5} More <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Clear checked button */}
      {checkedItems.length > 0 && (
        <button
          onClick={handleClearChecked}
          className="w-full mt-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Clear {checkedItems.length} checked item{checkedItems.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

export default ShoppingList;
