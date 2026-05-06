import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MN_LOCATIONS } from '@repo/shared';
import { fetchListingsByLocation } from '@web/lib/api/listings';
import { BreadcrumbJsonLd } from '@web/components/seo/JsonLd';
import type { Listing } from '@web/lib/api/types';

export const revalidate = 86400;

const BASE_URL = 'https://tusch.mn';

const CITY_SLUG_MAP: Record<string, string> = {
  Улаанбаатар: 'ulaanbaatar',
  Дархан: 'darkhan',
  Эрдэнэт: 'erdenet',
  Чойбалсан: 'choibalsan',
  Ховд: 'khovd',
};

const SLUG_TO_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_SLUG_MAP).map(([city, slug]) => [slug, city]),
);

const CITY_META: Record<string, { title: string; description: string }> = {
  ulaanbaatar: {
    title: 'Үйлчилгээ Улаанбаатарт',
    description:
      'Улаанбаатарт засвар, цэвэрлэгээ, зөөвөр болон бусад үйлчилгээ үзүүлэгч мэргэжилтнүүдийг Tusch.mn-с олоорой.',
  },
  darkhan: {
    title: 'Үйлчилгээ Дарханд',
    description:
      'Дархан хотод гэр засвар, зөөвөр, цэвэрлэгээний мэргэжлийн үйлчилгээ үзүүлэгчид — Tusch.mn.',
  },
  erdenet: {
    title: 'Үйлчилгээ Эрдэнэтэд',
    description:
      'Эрдэнэт хотод авто засвар, барилга, нүүлгэлт болон бусад үйлчилгээ — Tusch.mn дээрээс хайаарай.',
  },
  choibalsan: {
    title: 'Үйлчилгээ Чойбалсанд',
    description:
      'Чойбалсан хотод гэрийн үйлчилгээ: засвар, цэвэрлэгээ, хүүхэд асрамж — Tusch.mn.',
  },
  khovd: {
    title: 'Үйлчилгээ Ховдод',
    description:
      'Ховд хотод барилга, засвар болон бусад мэргэжлийн үйлчилгээ үзүүлэгчид — Tusch.mn.',
  },
};

export async function generateStaticParams() {
  return MN_LOCATIONS.map((loc) => ({
    slug: CITY_SLUG_MAP[loc.city] ?? loc.city.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = CITY_META[slug];
  if (!meta) return {};

  const cityName = SLUG_TO_CITY[slug];
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${BASE_URL}/villes/${slug}` },
    openGraph: {
      title: `${meta.title} | Tusch.mn`,
      description: meta.description,
      url: `${BASE_URL}/villes/${slug}`,
    },
    keywords: ['үйлчилгээ', cityName ?? slug, 'Tusch.mn', 'засвар', 'цэвэрлэгээ'],
  };
}

export default async function VillePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cityName = SLUG_TO_CITY[slug];
  const meta = CITY_META[slug];
  if (!cityName || !meta) notFound();

  const listings: Listing[] = await fetchListingsByLocation(cityName);

  const breadcrumbItems = [
    { name: 'Нүүр', url: BASE_URL },
    { name: 'Хотууд', url: `${BASE_URL}/villes` },
    { name: cityName, url: `${BASE_URL}/villes/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

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
            / <span>{cityName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            {meta.title} — <span className="text-primary">{cityName}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">{meta.description}</p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <p className="text-lg">{cityName}-т одоогоор зар байхгүй байна.</p>
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
                    {listing.category && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {listing.category}
                      </span>
                    )}
                    <span className="ml-auto text-base font-semibold text-foreground">
                      {listing.price > 0
                        ? `${listing.price.toLocaleString()} ₮`
                        : 'Тохиролцоно'}
                    </span>
                  </div>
                  <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {listing.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">📍 {cityName}</p>
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/listings?location=${encodeURIComponent(cityName)}`}
            className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {cityName} дахь бүх зарыг харах
          </Link>
        </div>
      </main>
    </>
  );
}
