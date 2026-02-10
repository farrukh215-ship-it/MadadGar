import Link from 'next/link';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      <main className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Emergency-friendly', 'Trust-first', 'Nearby'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-stone-100 text-stone-700 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-brand-900 leading-tight">
                Madad instantly. Trusted helpers through recommendations.
              </h1>
              <p className="mt-6 text-lg text-stone-600 max-w-xl">
                Google se login karein. Recommendations aur &quot;Madad ki ❤️&quot; system se nearby
                trusted helpers ko seconds mein find karein.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { icon: '📍', title: 'Nearby Feed', sub: '3-5 km radius' },
                  { icon: '⭐', title: 'Top Rated', sub: 'Trust score based' },
                  { icon: '📞', title: 'Quick Contact', sub: 'Call/Chat fast' },
                  { icon: '✓', title: 'Verified', sub: 'Recommendations' },
                ].map(({ icon, title, sub }) => (
                  <div
                    key={title}
                    className="p-4 rounded-xl bg-white/80 border border-stone-100 shadow-sm"
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="mt-2 font-semibold text-brand-900">{title}</p>
                    <p className="text-sm text-stone-500">{sub}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-500/25"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center shadow-xl">
                <span className="text-8xl">🏠</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-stone-200 bg-white/50 py-6">
        <p className="text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Madadgar — trusted helpers, nearby
        </p>
      </footer>
    </div>
  );
}
