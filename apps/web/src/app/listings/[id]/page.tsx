import type { Metadata } from 'next';
import { CATEGORY_LABEL_MAP } from '@repo/shared';
import { getListingByIdServer } from '@web/lib/api/listings';
import { resolveImageUrl } from '@web/lib/image';
import ListingDetailClient from './ListingDetailClient';
import { ServiceJsonLd, BreadcrumbJsonLd } from '@web/components/seo/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingByIdServer(id);

  if (!listing) {
    return { title: 'Зар олдсонгүй' };
  }

  const categoryLabel = listing.category
    ? CATEGORY_LABEL_MAP.get(listing.category) || listing.category
    : 'Зар';
  const locationPart = listing.location ? ` - ${listing.location}` : '';
  const title = `${categoryLabel}${locationPart}`;
  const description = listing.description?.slice(0, 160) || '';
  const resolvedImage = resolveImageUrl(listing.images?.[0]?.url);

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
  const listing = await getListingByIdServer(id);

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
