'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-stone-200/80 ${className}`}
      aria-hidden
    />
  );
}

export function FeedCardSkeleton() {
  return (
    <article className="rounded-xl overflow-hidden shadow-3d border border-stone-100/80 h-full flex flex-col bg-white">
      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden min-h-[72px]">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="p-2 flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-1/4 mt-1" />
      </div>
    </article>
  );
}

export function ChatRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-100">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 18}ms`, animationFillMode: 'backwards' }}>
          <FeedCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ChatListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 15}ms`, animationFillMode: 'backwards' }}>
          <ChatRowSkeleton />
        </div>
      ))}
    </div>
  );
}
