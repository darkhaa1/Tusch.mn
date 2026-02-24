import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tusch.mn';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3310';

interface SitemapListing {
  id: string;
  updatedAt?: string;
}

interface SitemapUser {
  id: string;
  updatedAt?: string;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/offerers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  const listingsData = await fetchJson<{ items: SitemapListing[] }>(
    `${API_URL}/listings?limit=1000`,
  );
  const listingPages: MetadataRoute.Sitemap = (listingsData?.items ?? []).map(
    (listing) => ({
      url: `${BASE_URL}/listings/${listing.id}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }),
  );

  const usersData = await fetchJson<{ items: SitemapUser[] }>(
    `${API_URL}/users/public?limit=1000`,
  );
  const userPages: MetadataRoute.Sitemap = (usersData?.items ?? []).map(
    (user) => ({
      url: `${BASE_URL}/u/${user.id}`,
      lastModified: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }),
  );

  return [...staticPages, ...listingPages, ...userPages];
}
