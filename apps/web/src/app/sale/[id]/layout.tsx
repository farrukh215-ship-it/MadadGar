import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Used Product | Madadgar',
  description: 'Buy and sell used products locally',
};

export default function SaleDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
