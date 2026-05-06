import type { Metadata } from 'next';
import { getUserPublicProfileServer } from '@web/lib/api/users';
import { resolveImageUrl } from '@web/lib/image';
import PublicProfileClient from './PublicProfileClient';
import { PersonJsonLd, BreadcrumbJsonLd } from '@web/components/seo/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getUserPublicProfileServer(id);

  if (!data) {
    return { title: 'Хэрэглэгч олдсонгүй' };
  }

  const fullName =
    [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') ||
    'Хэрэглэгч';
  const title = `${fullName} - Үйлчилгээ үзүүлэгч`;
  const description = `${fullName} - Tusch.mn дээрх үйлчилгээ үзүүлэгч`;
  const resolvedAvatar = resolveImageUrl(data.user.avatarUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://tusch.mn/u/${id}`,
      ...(resolvedAvatar && { images: [{ url: resolvedAvatar }] }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(resolvedAvatar && { images: [resolvedAvatar] }),
    },
    alternates: {
      canonical: `https://tusch.mn/u/${id}`,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUserPublicProfileServer(id);

  const fullName = data
    ? [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') ||
      'Хэрэглэгч'
    : '';
  const resolvedAvatar = resolveImageUrl(data?.user.avatarUrl) ?? undefined;

  return (
    <>
      {data && (
        <>
          <PersonJsonLd
            name={fullName}
            url={`https://tusch.mn/u/${id}`}
            image={resolvedAvatar}
          />
          <BreadcrumbJsonLd
            items={[
              { name: 'Tusch.mn', url: 'https://tusch.mn' },
              { name: 'Үйлчилгээ үзүүлэгчид', url: 'https://tusch.mn/offerers' },
              { name: fullName, url: `https://tusch.mn/u/${id}` },
            ]}
          />
        </>
      )}
      <PublicProfileClient />
    </>
  );
}
