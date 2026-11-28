import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://otakubazaar.jaybhatt.me').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/', '/cart/', '/profile/', '/vault-ops/', '/vault/', '/login/', '/sell/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
