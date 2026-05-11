/**
 * Atelier Home — CategoryGrid.
 * Mobile: 3x2 square grid with italic serif label overlay (atelier.jsx 256-273).
 * Desktop: 6-col strip, aspect 0.78, with mono "N мастер" + italic serif label (atelier-desktop.jsx 222-250).
 *
 * Uses the project's CATEGORIES list so categories link to /listings?category=<slug>.
 * Static "N+ мастер" counts are decorative — design demands a number, real count would need an API hook we don't yet have.
 */
import Link from 'next/link';
import { Placeholder, LabelMono } from '@web/components/ui-v2';
import { CATEGORIES } from '@repo/shared';
import type { PlaceholderTone } from '@web/components/ui-v2';

const labels = {
  sectionEyebrow: '№ 01',
  sectionTitlePrefix: 'Зургаан ',
  sectionTitleItalic: 'ангилал',
  sectionTitleSuffix: ', нэг товчоор.',
  sectionTitleMobile: 'Ангилал',
  seeAll: 'Бүгдийг үзэх →',
  seeAllShort: 'Бүгд →',
  masterCountSuffix: 'мастер',
};

/** Design-visible labels for the 6 atelier category slots, mapped onto first 6 real slugs. */
type CategoryEntry = {
  slug: string;
  label: string;
  count: string;
  tone: PlaceholderTone;
};

const TONES = ['terre', 'olive', 'ocre', 'cobalt', 'rose', 'pourpre'] as const satisfies readonly PlaceholderTone[];
const COUNTS = ['420+', '310+', '180+', '95+', '150+', '230+'] as const;

const ENTRIES: CategoryEntry[] = CATEGORIES.slice(0, 6).map((c, i) => ({
  slug: c.slug,
  label: c.label,
  count: COUNTS[i] ?? '0',
  tone: TONES[i] ?? 'sand',
}));

const darkTones: ReadonlyArray<PlaceholderTone> = ['terre', 'olive', 'cobalt', 'pourpre', 'rose'];

export default function CategoryGrid() {
  return (
    <>
      {/* MOBILE */}
      <section className="md:hidden bg-atelier-paper px-5.5 pb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2
            className="m-0"
            style={{
              fontFamily: 'var(--at-serif)',
              fontSize: 16,
              fontWeight: 500,
              fontStyle: 'var(--at-italic-style, italic)',
            }}
          >
            {labels.sectionTitleMobile}
          </h2>
          <LabelMono>{labels.seeAllShort}</LabelMono>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ENTRIES.map((c) => (
            <Link
              key={c.slug}
              href={`/listings?category=${c.slug}`}
              className="aspect-square relative overflow-hidden block"
              aria-label={c.label}
            >
              <Placeholder tone={c.tone} height="100%" />
              <span
                className="absolute left-2 bottom-2 right-2 text-atelier-cream"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 13,
                  fontStyle: 'var(--at-italic-style, italic)',
                  textShadow: '0 1px 4px rgba(0,0,0,.4)',
                }}
              >
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESKTOP */}
      <section className="hidden md:block bg-atelier-paper px-14 pt-15 pb-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <LabelMono>{labels.sectionEyebrow}</LabelMono>
            <h2
              className="m-0 mt-2 text-atelier-ink"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 44,
                fontWeight: 400,
                letterSpacing: '-0.035em',
              }}
            >
              {labels.sectionTitlePrefix}
              <em
                className="text-atelier-terre"
                style={{ fontStyle: 'var(--at-italic-style, italic)' }}
              >
                {labels.sectionTitleItalic}
              </em>
              {labels.sectionTitleSuffix}
            </h2>
          </div>
          <Link href="/listings">
            <LabelMono size="sm" tone="ink">
              {labels.seeAll}
            </LabelMono>
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {ENTRIES.map((c) => {
            const dark = darkTones.includes(c.tone);
            return (
              <Link
                key={c.slug}
                href={`/listings?category=${c.slug}`}
                className="relative overflow-hidden block"
                style={{ aspectRatio: '0.78' }}
                aria-label={c.label}
              >
                <Placeholder tone={c.tone} height="100%" />
                <div
                  className="absolute inset-0 p-[18px] flex flex-col justify-between"
                  style={{ color: dark ? 'var(--at-cream)' : 'var(--at-ink)' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--at-mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      opacity: 0.8,
                    }}
                  >
                    {c.count} {labels.masterCountSuffix}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--at-serif)',
                      fontSize: 22,
                      fontStyle: 'var(--at-italic-style, italic)',
                      lineHeight: 1,
                    }}
                  >
                    {c.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
