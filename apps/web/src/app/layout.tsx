import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@fontsource/noto-nastaliq-urdu';
import './globals.css';
import { IdleLogoutProvider } from '@/components/IdleLogoutProvider';
import { ChatToast } from '@/components/ChatToast';
import { ReferralApply } from '@/components/ReferralApply';
import { CityProvider } from '@/contexts/CityContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Madadgar — Trusted helpers, nearby',
  description: 'Trust-based recommendation network for local service providers',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
      <body className={`${plusJakarta.variable} font-sans antialiased bg-surface-base overflow-x-hidden max-w-[100vw]`} suppressHydrationWarning>
        <CityProvider>
          <IdleLogoutProvider>
            <ReferralApply />
            {children}
            <ChatToast />
          </IdleLogoutProvider>
        </CityProvider>
      </body>
    </html>
  );
}
