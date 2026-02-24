import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/messages/', '/api/'],
    },
    sitemap: 'https://tusch.mn/sitemap.xml',
  };
}
