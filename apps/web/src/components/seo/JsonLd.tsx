export interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Tusch.mn',
        url: 'https://tusch.mn',
        logo: 'https://tusch.mn/favicon.ico',
        description:
          'Монголын үйлчилгээний зах зээл: сантехник, барилга, зөөвөрлөлт, цэвэрлэгээ болон бусад.',
        areaServed: {
          '@type': 'Country',
          name: 'Mongolia',
        },
      }}
    />
  );
}

export interface ServiceJsonLdProps {
  name: string;
  description: string;
  providerName: string;
  areaServed?: string;
  price?: number;
  currency?: string;
}

export function ServiceJsonLd({
  name,
  description,
  providerName,
  areaServed,
  price,
  currency = 'MNT',
}: ServiceJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: {
          '@type': 'Person',
          name: providerName,
        },
        ...(areaServed && { areaServed }),
        ...(price != null && {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
          },
        }),
      }}
    />
  );
}

export interface PersonJsonLdProps {
  name: string;
  url: string;
  image?: string;
}

export function PersonJsonLd({ name, url, image }: PersonJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url,
        ...(image && { image }),
      }}
    />
  );
}

export interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
