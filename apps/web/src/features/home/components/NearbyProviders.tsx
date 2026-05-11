/**
 * Atelier Home — Nearby providers list.
 * Mobile: 2 rows, italic serif name + small svc line + "★ 4,9" rating (atelier.jsx 284-305).
 * Desktop: 4 rows with km, price, "142 ҮНЭЛГЭЭ" review count (atelier-desktop.jsx 271-298).
 *
 * No "nearby providers" API hook exists yet. Per SA-2 brief: keep static Mongolian
 * placeholder data here; a real geo-aware hook can replace this list later
 * without changing the rendered shape.
 */
import { Placeholder, LabelMono } from '@web/components/ui-v2';
import type { PlaceholderTone } from '@web/components/ui-v2';

const labels = {
  eyebrowDesktop: 'Ойролцоо · 1,2 км',
  titleDesktopA: 'Танай ',
  titleDesktopItalic: 'ойролцоо.',
  titleMobile: 'Ойролцоо',
  distanceMobile: '1,2 КМ',
  reviewCountSuffix: 'ҮНЭЛГЭЭ',
};

type Provider = {
  name: string;
  svc: string;
  rating: string;
  km: string;
  price: string;
  reviews: string;
  tone: PlaceholderTone;
};

const PROVIDERS: Provider[] = [
  {
    name: 'Бат-Эрдэнэ Б.',
    svc: 'Сантехникч · 12 жилийн туршлага',
    rating: '4,9',
    km: '0,4 км',
    price: '60,000₮/ц',
    reviews: '142',
    tone: 'terre',
  },
  {
    name: 'Цэцэгмаа Д.',
    svc: 'Хийлийн хичээл, эхлэгчээс ахисан',
    rating: '5,0',
    km: '0,8 км',
    price: '40,000₮/ц',
    reviews: '98',
    tone: 'ocre',
  },
  {
    name: 'Мөнхбат Д.',
    svc: 'Паркетчин, лакдалт',
    rating: '4,9',
    km: '1,1 км',
    price: '480,000₮-аас',
    reviews: '64',
    tone: 'rose',
  },
  {
    name: 'Оюун-Эрдэнэ Ц.',
    svc: 'Йогийн багш, ахисан түвшин',
    rating: '4,8',
    km: '1,2 км',
    price: '30,000₮/ц',
    reviews: '210',
    tone: 'olive',
  },
];

export default function NearbyProviders() {
  return (
    <>
      {/* MOBILE — first 2 only, simple rows */}
      <section className="md:hidden bg-atelier-paper px-5.5 py-5.5">
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
            {labels.titleMobile}
          </h2>
          <LabelMono>{labels.distanceMobile}</LabelMono>
        </div>
        {PROVIDERS.slice(0, 2).map((p) => (
          <div
            key={p.name}
            className="flex gap-3.5 py-3.5 items-center border-t border-atelier-line"
          >
            <div className="w-14 h-14 shrink-0">
              <Placeholder tone={p.tone} height={56} dense />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-atelier-ink"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {p.name}
              </div>
              <div className="text-xs text-atelier-muted mt-0.5 truncate">{p.svc}</div>
            </div>
            <div
              className="text-atelier-ink"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 16,
                fontStyle: 'var(--at-italic-style, italic)',
              }}
            >
              ★ {p.rating}
            </div>
          </div>
        ))}
      </section>

      {/* DESKTOP — 4 rows, full layout */}
      <div className="hidden md:block">
        <LabelMono className="mb-4.5 block">{labels.eyebrowDesktop}</LabelMono>
        <h2
          className="m-0 mb-6 text-atelier-ink"
          style={{
            fontFamily: 'var(--at-serif)',
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: '-0.03em',
          }}
        >
          {labels.titleDesktopA}
          <em style={{ fontStyle: 'var(--at-italic-style, italic)' }}>
            {labels.titleDesktopItalic}
          </em>
        </h2>
        {PROVIDERS.map((p) => (
          <div
            key={p.name}
            className="py-4.5 border-t border-atelier-line flex gap-4.5 items-center"
          >
            <div className="w-16 h-16 shrink-0">
              <Placeholder tone={p.tone} height={64} dense />
            </div>
            <div className="flex-1">
              <div
                className="text-atelier-ink"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                {p.name}
              </div>
              <div className="text-xs text-atelier-muted mt-0.5">{p.svc}</div>
              <div
                className="text-atelier-muted mt-1"
                style={{
                  fontFamily: 'var(--at-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                }}
              >
                {p.km} · {p.price}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-atelier-terre"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 17,
                  fontStyle: 'var(--at-italic-style, italic)',
                }}
              >
                ★ {p.rating}
              </div>
              <div
                className="text-atelier-muted mt-0.5"
                style={{
                  fontFamily: 'var(--at-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                }}
              >
                {p.reviews} {labels.reviewCountSuffix}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
