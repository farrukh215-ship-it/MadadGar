import Link from 'next/link';
import { Header } from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-brand-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-stone max-w-none text-stone-600">
          <p>We respect your privacy. Your data is used to provide and improve our services.</p>
          <Link href="/login" className="text-brand-600 font-medium hover:underline">← Back to Login</Link>
        </div>
      </main>
    </div>
  );
}
