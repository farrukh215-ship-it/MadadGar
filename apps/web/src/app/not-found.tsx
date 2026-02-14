import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base p-4">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">404</h1>
      <p className="text-stone-600 mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
      >
        Go home
      </Link>
    </div>
  );
}
