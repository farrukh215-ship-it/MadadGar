import Link from 'next/link';
import { Header } from '@/components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-brand-900 mb-6">Terms of Service</h1>
        <div className="prose prose-stone max-w-none text-stone-600">
          <p>By using Madadgar, you agree to our terms. Platform shares user-submitted info with other users for recommendations.</p>
          <Link href="/login" className="text-brand-600 font-medium hover:underline">← Back to Login</Link>
        </div>
      </main>
    </div>
  );
}
