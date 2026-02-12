'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  const Icon = icon ?? (
    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center border border-brand-100">
      <Search className="w-8 h-8 text-brand-600" strokeWidth={2} aria-hidden />
    </div>
  );

  return (
    <div
      className={`py-20 text-center bg-white rounded-2xl border border-stone-200/80 shadow-premium animate-fade-in ${className}`}
      role="status"
      aria-label={`${title}. ${subtitle ?? ''}`}
    >
      {Icon}
      <p className="mt-4 font-semibold text-stone-800">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition-all hover:shadow-premium-brand-hover btn-tap min-h-touch"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition-all hover:shadow-premium-brand-hover btn-tap min-h-touch"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
