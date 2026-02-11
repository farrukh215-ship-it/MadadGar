import Link from 'next/link';
import { Header } from '@/components/Header';
import { MapPin, Star, Phone, ShieldCheck, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: MapPin, title: 'Location Feed', sub: '3-5 km radius', iconBg: 'bg-emerald-500/10 text-emerald-600' },
  { icon: Star, title: 'Top Rated', sub: 'Trust score based', iconBg: 'bg-amber-500/10 text-amber-600' },
  { icon: Phone, title: 'Direct Call', sub: 'Connect instantly', iconBg: 'bg-brand-500/10 text-brand-600' },
  { icon: ShieldCheck, title: 'Verified', sub: 'Recommendations', iconBg: 'bg-green-500/10 text-green-600' },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[linear-gradient(165deg,_#f0fdf9_0%,_#ffffff_35%,_#f8fafc_70%,_#ecfdf5_100%)]">
      <Header />
      <main className="relative overflow-hidden">
        {/* Premium decorative elements */}
        <div className="absolute top-0 right-0 w-[min(90vw,480px)] h-[min(90vw,480px)] bg-gradient-to-br from-brand-200/30 to-teal-200/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[min(70vw,360px)] h-[min(70vw,360px)] bg-gradient-to-tr from-emerald-200/25 to-brand-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-5 sm:mb-6">
                {['Emergency-friendly', 'Trust-first', 'Nearby'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/90 border border-stone-200/80 shadow-premium text-stone-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-900 leading-[1.15] tracking-tight">
                Madad instantly. Trusted helpers through recommendations.
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Google se login karein. Recommendations aur &quot;Madad ki ❤️&quot; system se nearby
                trusted helpers ko seconds mein find karein.
              </p>
              <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
                {FEATURES.map(({ icon: Icon, title, sub, iconBg }) => (
                  <div
                    key={title}
                    className="group p-4 sm:p-5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-premium hover:shadow-premium-hover hover:border-brand-200/60 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.75} />
                    </div>
                    <p className="mt-2.5 sm:mt-3 font-semibold text-brand-900 text-sm sm:text-base">{title}</p>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="mt-8 sm:mt-10 inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all duration-200 shadow-premium-brand hover:shadow-premium-brand-hover hover:-translate-y-0.5"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[180px] sm:max-w-sm lg:max-w-md aspect-square mx-auto lg:mx-0">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand-100 via-teal-50 to-emerald-100 shadow-2xl shadow-brand-900/5 border border-white/80" />
                <div className="absolute inset-4 sm:inset-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/90 shadow-premium flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center shadow-premium-brand">
                      <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-semibold text-brand-900 text-sm sm:text-base">Trusted Help</p>
                      <p className="text-xs text-stone-500 mt-1">Nearby • Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-stone-200/80 bg-white/70 backdrop-blur-sm py-6 mt-auto">
        <p className="text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Madadgar — trusted helpers, nearby
        </p>
      </footer>
    </div>
  );
}
