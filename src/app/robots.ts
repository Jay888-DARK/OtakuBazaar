import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/infrastructure/utils/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/dashboard',
          '/account',
          '/checkout',
          '/cart',
          '/profile',
          '/vault-ops',
          '/vault',
          '/login',
          '/sell',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
