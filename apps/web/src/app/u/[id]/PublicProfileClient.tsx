'use client';

/**
 * Public Provider Profile — Atelier redesign (SA-5).
 * Mobile: cream hero band (back / "Профайл" mono / dots) + 80px avatar overlapping
 *         italic-last-name name + role + 3-col stats divider; paper body with sections
 *         Тухай / Чадвар / Хийсэн ажил · 24 (3×3 gallery) / Сүүлийн сэтгэгдэл; sticky
 *         bottom "Хайхтай холбогдох" CTA.
 * Desktop: terre hero band full-width (cream 180×180 avatar + 64px serif italic-last-name
 *          headline + tag badges + right CTA stack), 5-col stats strip with alternating
 *          paper/cream backgrounds, then 1fr/1.3fr grid: left Тухай + Чадвар (tone-colored
 *          chips) + Үнийн санал price list; right 9-tile gallery + Сэтгэгдэл list.
 *
 * Data fetching/hooks unchanged from the prior version — only UI/JSX changed.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePublicUserProfile, useCurrentUser } from '@web/lib/hooks/useApi';
import resolveImageUrl from '@web/lib/resolveImageUrl';
import { ReportDialogButton } from '@web/components/report/ReportDialogButton';
import {
  Avatar,
  Button,
  LabelMono,
  Placeholder,
  Tag,
  type PlaceholderTone,
} from '@web/components/ui-v2';

const labels = {
  back: 'Буцах',
  profile: 'Профайл',
  loading: 'Ачааллаж байна...',
  notFound: 'Хэрэглэгч олдсонгүй.',
  unknownUser: 'Хэрэглэгч',
  // hero / role
  defaultRole: 'Үйлчилгээ үзүүлэгч',
  // stats labels
  statReviews: 'сэтгэгдэл',
  statRating: 'үнэлгээ',
  statTenure: 'tusch-д',
  statResponse: 'хариу',
  statReplyTime: 'хариулах',
  // sections
  about: 'Тухай',
  skills: 'Чадвар',
  workDone: 'Хийсэн ажил',
  recentReviews: 'Сүүлийн сэтгэгдэл',
  reviewsSection: 'Сэтгэгдэл',
  priceList: 'Үнийн санал',
  seeAll: 'Бүгд →',
  // CTAs
  contactCta: (name: string) => `${name || 'Үйлчилгээ үзүүлэгчтэй'} холбогдох`,
  contactShort: 'Холбогдох →',
  addToFavorites: 'Дуртай нэмэх ♡',
  // tags
  tagVerified: '✓ ҮНЭМЛЭХ',
  tagRating: (r: string) => `★ ${r}`,
  tagMember: 'tusch+ ГИШҮҮН',
  // about empty
  noBio:
    'Уг үйлчилгээ үзүүлэгчийн талаар тайлбар одоогоор бэлэн биш байна. Холбогдож дэлгэрэнгүй мэдээлэл аваарай.',
  noListings: 'Одоогоор нийтэлсэн зар алга.',
  noReviews: 'Одоогоор сэтгэгдэл алга.',
  noSkills: 'Чадварын мэдээлэл одоогоор алга.',
  // misc
  ratingFallback: '—',
  master: 'Мастер',
};

const SKILL_TONES: PlaceholderTone[] = ['terre', 'olive', 'ocre', 'cobalt', 'rose', 'pourpre'];
const TAG_TONES: Array<'terre' | 'olive' | 'cobalt' | 'rose' | 'ocre' | 'pourpre'> = [
  'terre',
  'olive',
  'ocre',
  'cobalt',
  'rose',
  'pourpre',
];
const GALLERY_TONES: PlaceholderTone[] = [
  'terre',
  'ocre',
  'rose',
  'cobalt',
  'olive',
  'pourpre',
  'sand',
  'terre',
  'rose',
];

function formatRating(r: number | null): string {
  if (r === null || Number.isNaN(r)) return labels.ratingFallback;
  return r.toFixed(1).replace('.', ',');
}

function monthsSince(iso?: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

function tenureLabel(iso?: string | null): { value: string; unit: string } {
  const months = monthsSince(iso);
  if (months <= 0) return { value: 'Шинэ', unit: labels.statTenure };
  if (months < 12) return { value: `${months} сар`, unit: labels.statTenure };
  const years = Math.floor(months / 12);
  return { value: `${years} жил`, unit: labels.statTenure };
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days < 1) return 'Өнөөдөр';
  if (days < 7) return `${days} хоног`;
  if (days < 30) return `${Math.floor(days / 7)} долоо хоног`;
  if (days < 365) return `${Math.floor(days / 30)} сар`;
  return `${Math.floor(days / 365)} жил`;
}

export default function PublicProfileClient(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const { data, isLoading, error } = usePublicUserProfile(userId);
  const { data: currentUser } = useCurrentUser();

  const avatarUrl = resolveImageUrl(data?.user.avatarUrl || undefined) || undefined;
  const fullName = useMemo(() => {
    if (!data) return '';
    return (
      [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || labels.unknownUser
    );
  }, [data]);

  const firstName = data?.user.firstName || '';
  const lastName = data?.user.lastName || '';
  const initial =
    (data?.user.firstName?.[0] || data?.user.lastName?.[0] || '?').toUpperCase();

  const contactHref = `/messages?partnerId=${userId || ''}`;
  const canReport = Boolean(currentUser?.id && userId && currentUser.id !== userId);

  const reviewsCount = data?.stats.reviewsCount ?? 0;
  const ratingAvg = data?.stats.ratingAvg ?? null;
  const responseRate = data?.stats.responseRate ?? null;
  const listingsCount = data?.stats.listingsCount ?? 0;
  const tenure = tenureLabel(data?.user.createdAt);

  const memberSinceYear = data?.user.createdAt
    ? new Date(data.user.createdAt).getFullYear()
    : null;

  // Derive location / role line from service zones (best effort)
  const primaryZone = data?.user.serviceZones?.[0];
  const locationLine = primaryZone
    ? primaryZone.district
      ? `${primaryZone.city} · ${primaryZone.district}`
      : primaryZone.city
    : '';

  const heroEyebrow = [
    labels.master,
    locationLine,
    memberSinceYear ? `${memberSinceYear}-оос` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const recentListings = useMemo(() => data?.recentListings ?? [], [data?.recentListings]);
  const reviews = useMemo(() => data?.reviews ?? [], [data?.reviews]);

  // Derive distinct categories from recent listings as a "Чадвар" stand-in.
  const skills = useMemo(() => {
    const seen = new Set<string>();
    for (const l of recentListings) {
      if (l.category && !seen.has(l.category)) seen.add(l.category);
    }
    return Array.from(seen).slice(0, 6);
  }, [recentListings]);

  // Price list (Үнийн санал) — derived from first 3 recent listings.
  const priceList = useMemo(() => {
    return recentListings.slice(0, 3).map((l) => ({
      id: l.id,
      label: l.description?.split('\n')[0]?.slice(0, 60) || labels.defaultRole,
      price:
        typeof l.price === 'number' && l.price > 0
          ? `${l.price.toLocaleString('mn-MN')}₮`
          : '—',
    }));
  }, [recentListings]);

  if (isLoading) {
    return (
      <div className="bg-atelier-paper">
        <p
          className="py-16 text-center text-atelier-muted"
          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)' }}
        >
          {labels.loading}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-atelier-paper">
        <p
          className="py-16 text-center text-atelier-pourpre"
          style={{ fontFamily: 'var(--at-serif)' }}
        >
          {labels.notFound}
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // Sub-render helpers
  // ----------------------------------------------------------------------
  const renderNameHeadline = (sizePx: number, color: string, letterSpacing = '-0.02em') => (
    <h1
      className="m-0"
      style={{
        fontFamily: 'var(--at-serif)',
        fontWeight: 400,
        fontSize: sizePx,
        lineHeight: 1.05,
        letterSpacing,
        color,
      }}
    >
      {firstName}{' '}
      <em style={{ fontStyle: 'var(--at-italic-style, italic)' }}>
        {lastName || labels.unknownUser}
      </em>
    </h1>
  );

  const renderHeroBadges = (
    <div className="flex flex-wrap gap-2 mt-4 md:mt-5">
      {data.user.verification?.idVerified && (
        <span
          className="inline-flex items-center"
          style={{
            fontFamily: 'var(--at-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            padding: '5px 10px',
            background: 'var(--at-cream)',
            color: 'var(--at-ink)',
          }}
        >
          {labels.tagVerified}
        </span>
      )}
      <span
        className="inline-flex items-center"
        style={{
          fontFamily: 'var(--at-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          padding: '5px 10px',
          background: 'var(--at-ocre)',
          color: 'var(--at-ink)',
        }}
      >
        {labels.tagRating(formatRating(ratingAvg))}
      </span>
      {memberSinceYear && (
        <span
          className="inline-flex items-center"
          style={{
            fontFamily: 'var(--at-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            padding: '5px 10px',
            background: 'rgba(244,237,225,0.15)',
            color: 'var(--at-cream)',
          }}
        >
          {labels.tagMember}
        </span>
      )}
    </div>
  );

  // ----------------------------------------------------------------------
  // Mobile
  // ----------------------------------------------------------------------
  const mobileStats: Array<[string, string]> = [
    [String(reviewsCount), labels.statReviews],
    [formatRating(ratingAvg), labels.statRating],
    [tenure.value, tenure.unit],
  ];

  const mobile = (
    <div className="md:hidden bg-atelier-cream text-atelier-ink min-h-screen relative pb-24">
      {/* Hero band */}
      <div className="bg-atelier-cream px-5 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={labels.back}
            className="text-atelier-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <LabelMono size="xs" style={{ letterSpacing: '0.1em' }}>
            {labels.profile}
          </LabelMono>
          <span className="text-atelier-ink" aria-hidden="true">
            ⋯
          </span>
        </div>

        <div className="flex items-end gap-4 mt-5">
          <Avatar
            src={avatarUrl}
            alt={fullName}
            initial={initial}
            size="xl"
            tone="terre"
          />
          <div className="flex-1 pb-1">
            {renderNameHeadline(26, 'var(--at-ink)', '-0.03em')}
            <div
              className="mt-1 text-atelier-muted"
              style={{
                fontFamily: 'var(--at-serif)',
                fontStyle: 'var(--at-italic-style, italic)',
                fontSize: 13,
              }}
            >
              {locationLine || labels.defaultRole}
            </div>
          </div>
        </div>

        {/* Stats divider */}
        <div
          className="grid grid-cols-3 mt-5"
          style={{
            borderTop: '1px solid var(--at-line)',
            borderBottom: '1px solid var(--at-line)',
          }}
        >
          {mobileStats.map(([n, l], i) => (
            <div
              key={l}
              className="py-3 px-1 text-center"
              style={{
                borderRight: i < 2 ? '1px solid var(--at-line)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 22,
                  fontStyle: 'var(--at-italic-style, italic)',
                }}
              >
                {n}
              </div>
              <div
                className="mt-0.5 text-atelier-muted"
                style={{
                  fontFamily: 'var(--at-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="bg-atelier-paper px-5 py-6 space-y-6">
        {/* About */}
        <section>
          <LabelMono className="mb-2 block">{labels.about}</LabelMono>
          <p
            className="m-0 text-atelier-ink"
            style={{ fontFamily: 'var(--at-serif)', fontSize: 14, lineHeight: 1.5 }}
          >
            {labels.noBio}
          </p>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <LabelMono className="mb-3 block">{labels.skills}</LabelMono>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center"
                  style={{
                    fontFamily: 'var(--at-serif)',
                    fontSize: 13,
                    fontStyle: 'var(--at-italic-style, italic)',
                    padding: '5px 11px',
                    border: '1px solid var(--at-line)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Work gallery */}
        {recentListings.length > 0 && (
          <section>
            <LabelMono className="mb-3 block">
              {labels.workDone} · {listingsCount}
            </LabelMono>
            <div className="grid grid-cols-3 gap-1">
              {recentListings.slice(0, 6).map((l, i) => {
                const img =
                  resolveImageUrl(l.thumbnailUrl || undefined) ||
                  resolveImageUrl(l.imageUrl || undefined) ||
                  undefined;
                return (
                  <div key={l.id} className="aspect-square overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={l.description || ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Placeholder
                        tone={SKILL_TONES[i % SKILL_TONES.length]}
                        height="100%"
                        width="100%"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent review */}
        {reviews.length > 0 ? (
          <section>
            <LabelMono className="mb-3 block">{labels.recentReviews}</LabelMono>
            {reviews.slice(0, 1).map((rv) => {
              const who =
                [rv.reviewer.firstName, rv.reviewer.lastName].filter(Boolean).join(' ') ||
                labels.unknownUser;
              return (
                <div
                  key={rv.id}
                  className="py-3"
                  style={{ borderTop: '1px solid var(--at-line)' }}
                >
                  <div className="flex justify-between">
                    <div
                      style={{
                        fontFamily: 'var(--at-serif)',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {who}
                    </div>
                    <div
                      className="text-atelier-terre"
                      style={{ fontFamily: 'var(--at-mono)', fontSize: 10 }}
                      aria-label={`${rv.rating} оноо`}
                    >
                      {'★'.repeat(Math.max(0, Math.min(5, Math.round(rv.rating))))}
                    </div>
                  </div>
                  <p
                    className="m-0 mt-1.5 text-atelier-ink"
                    style={{
                      fontFamily: 'var(--at-serif)',
                      fontSize: 13,
                      lineHeight: 1.45,
                      fontStyle: 'var(--at-italic-style, italic)',
                    }}
                  >
                    «&nbsp;{rv.comment || labels.noReviews}&nbsp;»
                  </p>
                </div>
              );
            })}
          </section>
        ) : null}

        {canReport && userId && (
          <div className="pt-2">
            <ReportDialogButton
              targetType="USER"
              targetId={userId}
              variant="outline"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-atelier-paper px-5 py-3"
        style={{ borderTop: '1px solid var(--at-line)' }}
      >
        <Link href={contactHref} prefetch={false} className="block">
          <Button variant="primary" full size="md">
            {labels.contactCta(firstName)}
          </Button>
        </Link>
      </div>
    </div>
  );

  // ----------------------------------------------------------------------
  // Desktop
  // ----------------------------------------------------------------------
  const desktopStats: Array<[string, string]> = [
    [String(reviewsCount), labels.statReviews.toUpperCase()],
    [formatRating(ratingAvg), labels.statRating.toUpperCase()],
    [tenure.value, tenure.unit.toUpperCase()],
    [responseRate !== null ? `${responseRate}%` : '—', labels.statResponse.toUpperCase()],
    [String(listingsCount), 'ЗАР'],
  ];

  const desktop = (
    <div className="hidden md:block bg-atelier-paper text-atelier-ink">
      {/* Hero band */}
      <section
        className="relative px-14 pt-14 pb-12 text-atelier-cream"
        style={{ background: 'var(--at-terre)' }}
      >
        <div
          className="grid items-center gap-9"
          style={{ gridTemplateColumns: '180px 1fr auto' }}
        >
          <div className="w-45 h-45 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Placeholder tone="cream" height={180} width={180} dense />
            )}
          </div>

          <div className="min-w-0">
            <div
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 11,
                letterSpacing: '0.2em',
                opacity: 0.75,
              }}
            >
              {heroEyebrow || labels.defaultRole}
            </div>
            {renderNameHeadline(64, 'var(--at-cream)', '-0.04em')}
            <div
              className="mt-2"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 18,
                fontStyle: 'var(--at-italic-style, italic)',
                opacity: 0.9,
              }}
            >
              {locationLine ? `${labels.defaultRole} · ${locationLine}` : labels.defaultRole}
            </div>
            {renderHeroBadges}
          </div>

          <div className="flex flex-col gap-2.5">
            <Link href={contactHref} prefetch={false}>
              <button
                type="button"
                className="px-6 py-3.5 text-atelier-ink"
                style={{
                  background: 'var(--at-cream)',
                  fontFamily: 'var(--at-serif)',
                  fontSize: 15,
                  fontWeight: 500,
                  minWidth: 180,
                }}
              >
                {labels.contactShort}
              </button>
            </Link>
            <button
              type="button"
              className="px-6 py-3 text-atelier-cream"
              style={{
                border: '1px solid var(--at-cream)',
                fontFamily: 'var(--at-serif)',
                fontSize: 14,
                fontStyle: 'var(--at-italic-style, italic)',
                background: 'transparent',
                minWidth: 180,
              }}
            >
              {labels.addToFavorites}
            </button>
            {canReport && userId && (
              <ReportDialogButton
                targetType="USER"
                targetId={userId}
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          borderBottom: '1px solid var(--at-line)',
        }}
      >
        {desktopStats.map(([n, l], i) => (
          <div
            key={l}
            className="px-6 py-7 text-center"
            style={{
              background: i % 2 === 0 ? 'var(--at-paper)' : 'var(--at-cream)',
              borderRight: i < 4 ? '1px solid var(--at-line)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 36,
                fontStyle: 'var(--at-italic-style, italic)',
                letterSpacing: '-0.02em',
              }}
            >
              {n}
            </div>
            <div
              className="mt-1 text-atelier-muted"
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 10,
                letterSpacing: '0.15em',
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <section
        className="px-14 py-12 grid gap-14"
        style={{ gridTemplateColumns: '1fr 1.3fr' }}
      >
        {/* Left column */}
        <div className="min-w-0">
          <LabelMono>{labels.about}</LabelMono>
          <h2
            className="m-0 mt-2.5"
            style={{
              fontFamily: 'var(--at-serif)',
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            <em style={{ fontStyle: 'var(--at-italic-style, italic)' }}>{firstName || labels.unknownUser}</em>
            {' · '}
            {locationLine || labels.defaultRole}
          </h2>
          <p
            className="m-0 mt-4 text-atelier-ink"
            style={{ fontFamily: 'var(--at-serif)', fontSize: 16, lineHeight: 1.55 }}
          >
            {labels.noBio}
          </p>

          {skills.length > 0 ? (
            <>
              <LabelMono className="mt-8 mb-3.5 block">{labels.skills}</LabelMono>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <Tag
                    key={s}
                    variant="outline-tone"
                    tone={TAG_TONES[i % TAG_TONES.length]}
                    italic
                  >
                    {s}
                  </Tag>
                ))}
              </div>
            </>
          ) : (
            <>
              <LabelMono className="mt-8 mb-3.5 block">{labels.skills}</LabelMono>
              <p
                className="m-0 text-atelier-muted"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 14,
                  fontStyle: 'var(--at-italic-style, italic)',
                }}
              >
                {labels.noSkills}
              </p>
            </>
          )}

          {priceList.length > 0 && (
            <>
              <LabelMono className="mt-8 mb-3.5 block">{labels.priceList}</LabelMono>
              {priceList.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between py-3"
                  style={{ borderTop: '1px solid var(--at-line)' }}
                >
                  <span style={{ fontFamily: 'var(--at-serif)', fontSize: 15 }}>{p.label}</span>
                  <span
                    className="text-atelier-terre"
                    style={{
                      fontFamily: 'var(--at-serif)',
                      fontSize: 15,
                      fontStyle: 'var(--at-italic-style, italic)',
                    }}
                  >
                    {p.price}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right column */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between mb-3.5">
            <LabelMono>
              {labels.workDone} · {listingsCount}
            </LabelMono>
            <span
              className="text-atelier-ink"
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {labels.seeAll}
            </span>
          </div>
          {recentListings.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => {
                const l = recentListings[i % recentListings.length];
                const img = l
                  ? resolveImageUrl(l.thumbnailUrl || undefined) ||
                    resolveImageUrl(l.imageUrl || undefined) ||
                    undefined
                  : undefined;
                return (
                  <div key={i} className="aspect-square overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={l?.description || ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Placeholder
                        tone={GALLERY_TONES[i % GALLERY_TONES.length]}
                        height="100%"
                        width="100%"
                        dense
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              className="m-0 text-atelier-muted"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 14,
                fontStyle: 'var(--at-italic-style, italic)',
              }}
            >
              {labels.noListings}
            </p>
          )}

          <LabelMono className="mt-8 mb-3.5 block">{labels.reviewsSection}</LabelMono>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((rv) => {
              const who =
                [rv.reviewer.firstName, rv.reviewer.lastName].filter(Boolean).join(' ') ||
                labels.unknownUser;
              return (
                <div
                  key={rv.id}
                  className="py-4"
                  style={{ borderTop: '1px solid var(--at-line)' }}
                >
                  <div className="flex justify-between items-baseline">
                    <div
                      style={{
                        fontFamily: 'var(--at-serif)',
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {who}
                    </div>
                    <div
                      className="text-atelier-terre"
                      style={{
                        fontFamily: 'var(--at-mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {'★'.repeat(Math.max(0, Math.min(5, Math.round(rv.rating))))}{' '}
                      <span className="text-atelier-muted ml-2">
                        {formatReviewDate(rv.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p
                    className="m-0 mt-1.5"
                    style={{
                      fontFamily: 'var(--at-serif)',
                      fontSize: 15,
                      fontStyle: 'var(--at-italic-style, italic)',
                      lineHeight: 1.5,
                    }}
                  >
                    «&nbsp;{rv.comment || labels.noReviews}&nbsp;»
                  </p>
                </div>
              );
            })
          ) : (
            <p
              className="m-0 text-atelier-muted"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 14,
                fontStyle: 'var(--at-italic-style, italic)',
              }}
            >
              {labels.noReviews}
            </p>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <>
      {mobile}
      {desktop}
    </>
  );
}
