'use client';

import { useState } from 'react';
import { Calendar, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import Header from '@/components/navigation/Header';
import { MealsTodayView, MealsWeekView } from '@/components/meals';

type TabType = 'today' | 'week';

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Header title="Meals" showPersonToggle={true} />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('today')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'today'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Today
            {activeTab === 'today' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'week'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Calendar className="w-4 h-4" />
            Week Plan
            {activeTab === 'week' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'today' ? <MealsTodayView /> : <MealsWeekView />}
    </div>
  );
}
