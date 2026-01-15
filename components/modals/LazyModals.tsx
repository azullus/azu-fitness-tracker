'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Loading fallback for modals
 * Shows a centered loading spinner with backdrop
 */
function ModalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="md" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Lazy-loaded AddPantryItemModal with loading state
 * Use this for non-critical paths to reduce initial bundle size
 */
export const LazyAddPantryItemModal = dynamic(
  () => import('./AddPantryItemModal').then((mod) => mod.AddPantryItemModal),
  {
    loading: () => <ModalLoading />,
    ssr: false, // Modal uses client-side state
  }
);
