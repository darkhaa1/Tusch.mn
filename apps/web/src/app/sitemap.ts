import type { MetadataRoute } from 'next';
import { CATEGORIES, MN_LOCATIONS } from '@repo/shared';

const BASE_URL = 'https://tusch.mn';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3310';

const CITY_SLUG_MAP: Record<string, string> = {
  Улаанбаатар: 'ulaanbaatar',
  Дархан: 'darkhan',
  Эрдэнэт: 'erdenet',
  Чойбалсан: 'choibalsan',
  Ховд: 'khovd',
};

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
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/offerers`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug.replace(/_/g, '-')}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const cityPages: MetadataRoute.Sitemap = MN_LOCATIONS.map((loc) => ({
    url: `${BASE_URL}/villes/${CITY_SLUG_MAP[loc.city] ?? loc.city.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const listingsData = await fetchJson<{ items: SitemapListing[] }>(
    `${API_URL}/listings?limit=1000`,
  );
  const listingPages: MetadataRoute.Sitemap = (listingsData?.items ?? []).map(
    (listing) => ({
      url: `${BASE_URL}/listings/${listing.id}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : now,
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
      lastModified: user.updatedAt ? new Date(user.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }),
  );

  return [...staticPages, ...categoryPages, ...cityPages, ...listingPages, ...userPages];
}
