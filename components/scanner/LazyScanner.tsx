'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Loading fallback for the BarcodeScannerModal
 * Shows a full-screen loading state
 */
function ScannerLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white text-lg">Loading scanner...</p>
      </div>
    </div>
  );
}

/**
 * Lazy-loaded BarcodeScannerModal with loading state
 * Use this instead of directly importing BarcodeScannerModal to reduce initial bundle size
 * The barcode scanner library (html5-qrcode) is heavy and only needed when scanning
 */
export const LazyBarcodeScannerModal = dynamic(
  () => import('./BarcodeScannerModal').then((mod) => mod.BarcodeScannerModal),
  {
    loading: () => <ScannerLoading />,
    ssr: false, // Scanner uses camera APIs which are browser-only
  }
);
