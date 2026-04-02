import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/profile/', '/messages/', '/api/', '/notifications/'],
    },
    sitemap: 'https://tusch.mn/sitemap.xml',
  };
}
