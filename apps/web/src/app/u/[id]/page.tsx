import type { Metadata } from 'next';
import PublicProfileClient from './PublicProfileClient';
import { PersonJsonLd, BreadcrumbJsonLd } from '@web/components/seo/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3310';

interface UserData {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

async function fetchUser(id: string): Promise<UserData | null> {
  try {
    const res = await fetch(`${API_URL}/users/${id}/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchUser(id);

  if (!data) {
    return { title: 'Хэрэглэгч олдсонгүй' };
  }

  const fullName =
    [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') ||
    'Хэрэглэгч';
  const title = `${fullName} - Үйлчилгээ үзүүлэгч`;
  const description = `${fullName} - Tusch.mn дээрх үйлчилгээ үзүүлэгч`;
  const avatarUrl = data.user.avatarUrl;
  const resolvedAvatar = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${API_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
    : undefined;

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
  const data = await fetchUser(id);

  const fullName = data
    ? [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') ||
      'Хэрэглэгч'
    : '';
  const avatarUrl = data?.user.avatarUrl;
  const resolvedAvatar = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${API_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
    : undefined;

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
