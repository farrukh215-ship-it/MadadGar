'use client';

import { AlertCircle } from 'lucide-react';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`py-16 text-center bg-white rounded-2xl border border-stone-200 shadow-premium animate-fade-in ${className}`}
      role="alert"
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
        <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-4 font-semibold text-stone-800">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition btn-tap min-h-touch"
        >
          Retry
        </button>
      )}
    </div>
  );
}
