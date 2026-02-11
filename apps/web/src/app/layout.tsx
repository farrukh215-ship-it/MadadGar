import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { IdleLogoutProvider } from '@/components/IdleLogoutProvider';
import { ChatToast } from '@/components/ChatToast';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Madadgar — Trusted helpers, nearby',
  description: 'Trust-based recommendation network for local service providers',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} antialiased bg-slate-50`} suppressHydrationWarning>
        <IdleLogoutProvider>
          {children}
          <ChatToast />
        </IdleLogoutProvider>
      </body>
    </html>
  );
}
