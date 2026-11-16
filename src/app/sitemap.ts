import type { MetadataRoute } from 'next';
import { MOCK_GRAILS } from '@/lib/mockProducts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://otaku-bazaar.vercel.app';

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/shipping-returns',
    '/prohibited-items',
    '/escrow-policy',
    '/terms-of-service',
    '/privacy-policy',
    '/legal/terms',
    '/legal/privacy',
    '/legal/refunds',
    '/search',
    '/sell',
    '/login',
    '/vault',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = MOCK_GRAILS.map((product) => ({
    url: `${baseUrl}/lot/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
