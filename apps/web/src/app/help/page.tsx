import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-brand-900 mb-6">Help</h1>
        <div className="space-y-6 text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-brand-800 mb-2">How does Madadgar work?</h2>
            <p>
              Madadgar connects you with trusted local helpers (mechanics, electricians, plumbers, etc.)
              through recommendations from people you know. Browse nearby trusted helpers, see ratings,
              and contact them directly via call or chat.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-brand-800 mb-2">How to post a recommendation?</h2>
            <p>
              Once logged in, tap &quot;Post&quot; in the bottom navigation. Add the helper&apos;s details,
              category, and your reason for recommending them. Your recommendation helps others find
              trusted help nearby.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-brand-800 mb-2">Need more help?</h2>
            <p>
              Contact us at support@madadgar.app or visit our community forum.
            </p>
          </section>
        </div>
        <Link href="/" className="inline-block mt-8 text-brand-600 font-medium hover:underline">
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
