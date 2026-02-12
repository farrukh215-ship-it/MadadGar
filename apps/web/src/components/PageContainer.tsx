'use client';

export function PageContainer({
  children,
  className = '',
  maxWidth = 'max-w-5xl',
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
