import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@repo/shared';
import { fetchListingsByCategory } from '@web/lib/api/listings';
import { BreadcrumbJsonLd, JsonLd } from '@web/components/seo/JsonLd';
import type { Listing } from '@web/lib/api/types';

export const revalidate = 86400;

const BASE_URL = 'https://tusch.mn';

function toUrlSlug(categorySlug: string) {
  return categorySlug.replace(/_/g, '-');
}

function fromUrlSlug(urlSlug: string) {
  return urlSlug.replace(/-/g, '_');
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  network_repair: {
    title: 'Шугам сүлжээ засвар угсралт',
    description:
      'Гэр, оффисын шугам сүлжээ, усны хоолой, цахилгааны засвар угсралтын мэргэжилтнүүдийг Tusch.mn-с олоорой.',
  },
  construction_renovation: {
    title: 'Барилга / Дотор засал',
    description:
      'Барилга, дотор засал, шал, тааз, ханын дизайн — туршлагатай гэрийн засварчдыг Tusch.mn-с хайаарай.',
  },
  moving: {
    title: 'Нүүлгэлт',
    description:
      'Гэр нүүлгэх, тавилга зөөх, ачаа тээврийн найдвартай үйлчилгээг Tusch.mn-с захиалаарай.',
  },
  home_cleaning: {
    title: 'Гэр цэвэрлэгээ',
    description:
      'Гэр, оффис цэвэрлэгээ, нарийвчилсан угаалга — Tusch.mn дээрх мэргэжлийн цэвэрлэгчид.',
  },
  carpentry: {
    title: 'Мужаан, тавилга угсралт',
    description:
      'Мужаан, тавилга угсралт, модон бүтээц — Tusch.mn дэх чанартай ажлын баталгаатай гарын авлага.',
  },
  auto_repair: {
    title: 'Авто засвар',
    description:
      'Авто засвар, оношлогоо, тосны солилт — Tusch.mn дээрх итгэлтэй механикчид.',
  },
  babysitting: {
    title: 'Хүүхэд асрагч',
    description:
      'Хүүхэд хариуламж, асрамж — Tusch.mn дэх найдвартай хүүхэд асрагчид.',
  },
  tutoring: {
    title: 'Гэрийн багш',
    description:
      'Гэрийн багш, хичээлийн дэмжлэг — математик, хими, хэл болон бусад хичээлийн багш нар Tusch.mn-д.',
  },
};

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: toUrlSlug(c.slug) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categorySlug = fromUrlSlug(slug);
  const meta = CATEGORY_META[categorySlug];
  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${BASE_URL}/categories/${slug}` },
    openGraph: {
      title: `${meta.title} | Tusch.mn`,
      description: meta.description,
      url: `${BASE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categorySlug = fromUrlSlug(slug);
  const meta = CATEGORY_META[categorySlug];
  if (!meta) notFound();

  const listings: Listing[] = await fetchListingsByCategory(categorySlug);

  const breadcrumbItems = [
    { name: 'Нүүр', url: BASE_URL },
    { name: 'Ангилал', url: `${BASE_URL}/categories` },
    { name: meta.title, url: `${BASE_URL}/categories/${slug}` },
  ];

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title,
    description: meta.description,
    url: `${BASE_URL}/categories/${slug}`,
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/listings/${listing.id}`,
      name: listing.description?.slice(0, 80) || meta.title,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={itemListJsonLd} />

      <main className="py-8">
        <div className="mb-8">
          <nav className="mb-4 text-sm text-muted-foreground" aria-label="Навигаци">
            <Link href="/" className="hover:underline">
              Нүүр
            </Link>{' '}
            /{' '}
            <Link href="/listings" className="hover:underline">
              Зарууд
            </Link>{' '}
            / <span>{meta.title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground">{meta.description}</p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <p className="text-lg">Одоогоор зар байхгүй байна.</p>
            <p className="mt-1 text-sm">
              Та{' '}
              <Link href="/listings" className="text-primary hover:underline">
                бүх зарыг
              </Link>{' '}
              харах боломжтой.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md"
              >
                <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {meta.title}
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      {listing.price > 0
                        ? `${listing.price.toLocaleString()} ₮`
                        : 'Тохиролцоно'}
                    </span>
                  </div>
                  <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {listing.description}
                  </p>
                  {listing.location && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      📍 {listing.location}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/listings?category=${categorySlug}`}
            className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Бүх {meta.title.toLowerCase()} зарыг харах
          </Link>
        </div>
      </main>
    </>
  );
}
