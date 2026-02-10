import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://madadgar.app';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/post`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sale`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/profile`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];
}
