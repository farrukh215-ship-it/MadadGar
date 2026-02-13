'use client';

import { useEffect, useState } from 'react';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quote',
});

const QUOTES: { text: string; author?: string; bg: string }[] = [
  {
    text: 'Have something in life that keeps you awake at night—passion is the soul\'s compass.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(13,148,136,0.95) 0%, rgba(19,78,74,0.9) 100%), url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80) center/cover',
  },
  {
    text: 'Helping others is not a duty—it is the very meaning of life.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(13,148,136,0.9) 100%), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80) center/cover',
  },
  {
    text: 'True love is not measured by what you receive—it is measured by what you give.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(236,72,153,0.9) 0%, rgba(190,24,93,0.9) 100%), url(https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80) center/cover',
  },
  {
    text: 'Trust is the foundation of every bond—build it with kindness, not words.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(124,58,237,0.9) 100%), url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80) center/cover',
  },
  {
    text: 'A life without purpose is like a ship without a sail—find your north star.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(14,165,233,0.9) 0%, rgba(6,182,212,0.9) 100%), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80) center/cover',
  },
  {
    text: 'Friendship is the only cement that will ever hold the world together.',
    author: 'W. Wood',
    bg: 'linear-gradient(135deg, rgba(236,72,153,0.9) 0%, rgba(245,158,11,0.9) 100%), url(https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80) center/cover',
  },
  {
    text: 'Small acts of kindness can create ripples that change the world.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(13,148,136,0.9) 0%, rgba(34,197,94,0.9) 100%), url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80) center/cover',
  },
  {
    text: 'Love is not in the grand gestures—it is in the quiet moments of understanding.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%), url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80) center/cover',
  },
  {
    text: 'Your purpose is not to find yourself—it is to create yourself through service.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(13,148,136,0.9) 0%, rgba(6,182,212,0.9) 100%), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80) center/cover',
  },
  {
    text: 'The best way to find yourself is to lose yourself in the service of others.',
    author: 'Gandhi',
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(13,148,136,0.9) 100%), url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80) center/cover',
  },
  {
    text: 'Trust is earned in drops and lost in buckets—choose your actions wisely.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.9) 100%), url(https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80) center/cover',
  },
  {
    text: 'Real connection is the bridge between two souls—build it with authenticity.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(244,63,94,0.9) 0%, rgba(236,72,153,0.9) 100%), url(https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80) center/cover',
  },
  {
    text: 'Passion is the fire that wakes you up—fear is the shadow that holds you back.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(234,88,12,0.9) 100%), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80) center/cover',
  },
  {
    text: 'A life without love is like a garden without flowers—it survives but does not bloom.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(236,72,153,0.9) 0%, rgba(244,63,94,0.9) 100%), url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80) center/cover',
  },
  {
    text: 'Helping others is not charity—it is the highest form of self-respect.',
    author: undefined,
    bg: 'linear-gradient(135deg, rgba(13,148,136,0.9) 0%, rgba(34,197,94,0.9) 100%), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80) center/cover',
  },
];

function playOpenSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore if audio not supported
  }
}

export function AppOpenExperience() {
  const [quote, setQuote] = useState<typeof QUOTES[0] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = sessionStorage.getItem('madadgar_quote_shown');
    if (!shown) {
      playOpenSound();
      const idx = Math.floor(Math.random() * QUOTES.length);
      setQuote(QUOTES[idx]);
      sessionStorage.setItem('madadgar_quote_shown', '1');
    }
  }, []);

  if (!quote || dismissed) return null;

  return (
    <div
      className={`${cormorant.variable} fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in`}
      onClick={() => setDismissed(true)}
      role="dialog"
      aria-label="Daily quote"
    >
      <div
        className="relative max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: quote.bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative p-8 sm:p-10 text-white">
          <p className={`${cormorant.className} text-2xl sm:text-3xl font-medium leading-relaxed tracking-wide italic`}>
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author && (
            <p className="mt-4 text-lg font-semibold opacity-90">— {quote.author}</p>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="mt-6 w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm font-semibold transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
