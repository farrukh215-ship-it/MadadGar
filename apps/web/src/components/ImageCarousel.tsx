'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

type ImageCarouselProps = {
  images: string[];
  alt: string;
  /** Fallback icon when no images (e.g. '📦') */
  fallbackIcon?: string;
  /** compact = for cards, full = for detail pages */
  variant?: 'compact' | 'full';
  /** Whether to use object-cover (card) or object-contain (detail) */
  objectFit?: 'cover' | 'contain';
  /** Optional: open lightbox on image click */
  onImageClick?: (index: number) => void;
  /** Additional className for the container */
  className?: string;
  /** Use fill for parent, or aspect ratio */
  aspectClass?: string;
  /** Controlled index - when set, syncs with thumbnail clicks */
  index?: number;
  onIndexChange?: (index: number) => void;
};

export function ImageCarousel({
  images,
  alt,
  fallbackIcon = '📦',
  variant = 'compact',
  objectFit = 'cover',
  onImageClick,
  className = '',
  aspectClass = 'aspect-square',
  index: controlledIndex,
  onIndexChange,
}: ImageCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex ?? internalIndex;
  const setCurrentIndex = onIndexChange ?? setInternalIndex;

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = (currentIndex + 1) % images.length;
      setCurrentIndex(next);
    },
    [images.length, currentIndex, setCurrentIndex]
  );

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = (currentIndex - 1 + images.length) % images.length;
      setCurrentIndex(prev);
    },
    [images.length, currentIndex, setCurrentIndex]
  );

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      if (onImageClick) {
        e.preventDefault();
        e.stopPropagation();
        onImageClick(currentIndex);
      }
    },
    [onImageClick, currentIndex]
  );

  if (!images.length) {
    return (
      <div className={`${aspectClass} bg-stone-100 flex items-center justify-center ${className}`}>
        <span className="text-4xl sm:text-6xl text-stone-300">{fallbackIcon}</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`${aspectClass} bg-stone-100 relative overflow-hidden ${className}`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className={`object-${objectFit} ${onImageClick ? 'cursor-zoom-in' : ''}`}
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          onClick={handleImageClick}
        />
      </div>
    );
  }

  return (
    <div className={`${aspectClass} bg-stone-100 relative overflow-hidden group ${className}`}>
      <Image
        src={images[currentIndex]}
        alt={`${alt} (${currentIndex + 1}/${images.length})`}
        fill
        className={`object-${objectFit} ${onImageClick ? 'cursor-zoom-in' : ''}`}
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        onClick={handleImageClick}
      />

      {/* Left arrow */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity z-10 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        type="button"
        onClick={goNext}
        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity z-10 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Next image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Photo count badge */}
      <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-lg bg-black/50 text-white text-[10px] font-medium z-10">
        {currentIndex + 1}/{images.length}
      </span>

      {/* Dots indicator - full variant only */}
      {variant === 'full' && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
