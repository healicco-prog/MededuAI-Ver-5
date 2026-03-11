'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js Client-Side App Error Caught:', error);

    // Automatically recover from chunk load errors caused by new deployments
    if (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('chunk') || error.message.toLowerCase().includes('client-side')) {
      const hasReloaded = sessionStorage.getItem('chunk-error-reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk-error-reloaded', 'true');
        window.location.reload(); // Force a hard reload from the server
      }
    }
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl m-8 border border-slate-200 shadow-sm">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
      <p className="text-slate-500 mb-8 max-w-md text-center">
        The application encountered an unexpected error. This usually happens when a new version is released while you are navigating.
      </p>
      <button
        onClick={() => {
          sessionStorage.removeItem('chunk-error-reloaded');
          window.location.reload();
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
      >
        Reload Dashboard
      </button>
    </div>
  );
}
