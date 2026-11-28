import type { MetadataRoute } from 'next';
import { ListingRepository } from '@/infrastructure/database/repositories/ListingRepository';
import { getSiteUrl } from '@/infrastructure/utils/siteUrl';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes = [
    '',
    '/catalog',
    '/search',
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
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: (route === '' || route === '/catalog' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : route === '/catalog' ? 0.9 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const activeListings = await ListingRepository.findAllActive();
    productRoutes = activeListings
      .filter(
        (listing) =>
          (listing.status === 'ACTIVE' || listing.status === 'RESERVED') &&
          Boolean(listing.updatedAt) &&
          !listing.id.toLowerCase().startsWith('demo') &&
          !listing.sellerId.startsWith('user_seller_') &&
          !listing.sellerId.startsWith('user_admin_')
      )
      .map((listing) => ({
        url: `${siteUrl}/lot/${listing.id}`,
        lastModified: listing.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
  } catch (err) {
    console.warn('[sitemap] Failed to fetch active listings for sitemap:', err);
  }

  return [...staticRoutes, ...productRoutes];
}
