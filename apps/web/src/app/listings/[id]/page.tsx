import type { Metadata } from 'next';
import { CATEGORY_LABEL_MAP } from '@repo/shared';
import ListingDetailClient from './ListingDetailClient';
import { ServiceJsonLd, BreadcrumbJsonLd } from '@web/components/seo/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3310';

interface ListingData {
  id: string;
  description?: string;
  category?: string;
  price?: number;
  location?: string;
  images?: { url?: string }[];
  user?: { firstName?: string; lastName?: string };
}

async function fetchListing(id: string): Promise<ListingData | null> {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function resolveImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListing(id);

  if (!listing) {
    return { title: 'Зар олдсонгүй' };
  }

  const categoryLabel = listing.category
    ? CATEGORY_LABEL_MAP.get(listing.category) || listing.category
    : 'Зар';
  const locationPart = listing.location ? ` - ${listing.location}` : '';
  const title = `${categoryLabel}${locationPart}`;
  const description = listing.description?.slice(0, 160) || '';
  const resolvedImage = resolveImage(listing.images?.[0]?.url);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://tusch.mn/listings/${id}`,
      ...(resolvedImage && { images: [{ url: resolvedImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(resolvedImage && { images: [resolvedImage] }),
    },
    alternates: {
      canonical: `https://tusch.mn/listings/${id}`,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await fetchListing(id);

  const categoryLabel = listing?.category
    ? CATEGORY_LABEL_MAP.get(listing.category) || listing.category
    : 'Үйлчилгээ';
  const providerName = listing?.user
    ? [listing.user.firstName, listing.user.lastName].filter(Boolean).join(' ')
    : '';

  return (
    <>
      {listing && (
        <>
          <ServiceJsonLd
            name={categoryLabel}
            description={listing.description || ''}
            providerName={providerName || 'Үйлчилгээ үзүүлэгч'}
            areaServed={listing.location}
            price={listing.price}
          />
          <BreadcrumbJsonLd
            items={[
              { name: 'Tusch.mn', url: 'https://tusch.mn' },
              { name: 'Зарууд', url: 'https://tusch.mn/listings' },
              {
                name: listing.description?.slice(0, 40) || 'Зар',
                url: `https://tusch.mn/listings/${id}`,
              },
            ]}
          />
        </>
      )}
      <ListingDetailClient />
    </>
  );
}
