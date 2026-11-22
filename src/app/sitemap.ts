import type { MetadataRoute } from 'next';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const activeListings = await ListingRepository.findAllActive();
    productRoutes = activeListings.map((listing) => ({
      url: `${baseUrl}/lot/${listing.id}`,
      lastModified: listing.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (err) {
    console.warn('[sitemap] Failed to fetch active listings for sitemap:', err);
  }

  return [...staticRoutes, ...productRoutes];
}
