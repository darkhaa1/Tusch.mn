/**
 * Atelier Home — Hero.
 * Mobile: greeting eyebrow + serif headline + bordered search bar (per atelier.jsx 215-254).
 * Desktop: 88px serif, 2-col with overlapping image blocks (per atelier-desktop.jsx 176-214).
 *
 * Server component. All copy is local in `labels` (project rule: no central i18n edits).
 */
import { Placeholder } from '@web/components/ui-v2';

const labels = {
  greetingMobile: 'Сайн байна уу, Оюун-Эрдэнэ',
  greetingDesktop: 'Сайн уу, Оюуна — Улаанбаатар, СБД',
  headlineMobilePrefix: 'Танд ямар ',
  headlineMobileItalic: 'үйлчилгээ',
  headlineMobileSuffix: ' хэрэгтэй вэ?',
  headlineDesktopLine1: 'Танай хорооллын',
  headlineDesktopItalic: 'чанартай',
  headlineDesktopAfter: ' мастерууд',
  leadDesktop:
    'tusch нь сантехникч, багш, цэвэрлэгчдийг чамтай хамгийн ойр газраас холбоно. Үнэлгээ үнэгүй, бүх төлбөр хамгаалагдсан.',
  searchPlaceholder: 'Сантехник, иогийн багш…',
  searchPlaceholderDesktop: 'Сантехникч, иогийн багш, шкаф угсрах…',
  searchAction: 'Хайх →',
  loc: 'УБ · СБД',
  statRating: '★ 4,9',
  statReviews: '· 12,400 сэтгэгдэл',
  statVerified: 'Бүх мастер баталгаажсан',
  statResponse: '24 цагт хариу',
  todayBadge: 'ӨНӨӨДӨР',
  todayCount: '184',
  todayCaption: 'САНАЛ ИРСЭН',
  imgPlumber: 'Бат-Эрдэнэ · Сантехникч',
  imgViolin: 'Цэцэгмаа · Хийл',
};

export default function Hero() {
  return (
    <>
      {/* MOBILE HERO */}
      <section className="md:hidden bg-atelier-paper">
        <div className="px-[22px] pt-1 pb-[14px]">
          <div
            className="uppercase text-atelier-muted mb-[10px]"
            style={{
              fontFamily: 'var(--at-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
            }}
          >
            {labels.greetingMobile}
          </div>
          <h1
            className="m-0 text-atelier-ink"
            style={{
              fontFamily: 'var(--at-serif)',
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            {labels.headlineMobilePrefix}
            <em
              className="text-atelier-terre"
              style={{ fontStyle: 'var(--at-italic-style, italic)' }}
            >
              {labels.headlineMobileItalic}
            </em>
            <br />
            хэрэгтэй вэ?
          </h1>

          <form
            className="mt-[18px] bg-atelier-paper border border-atelier-ink flex items-center gap-[10px] px-4 py-[14px]"
            action="/listings"
            role="search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <input
              type="search"
              name="search"
              placeholder={labels.searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-sm text-atelier-ink placeholder:text-atelier-muted"
              aria-label={labels.searchPlaceholder}
            />
            <span
              className="text-atelier-muted"
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
              }}
            >
              {labels.loc}
            </span>
          </form>
        </div>
      </section>

      {/* DESKTOP HERO */}
      <section className="hidden md:block bg-atelier-paper">
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-center px-14 pt-14 pb-10">
          <div>
            <div
              className="uppercase text-atelier-muted mb-[18px]"
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              {labels.greetingDesktop}
            </div>
            <h1
              className="m-0 text-atelier-ink"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 88,
                fontWeight: 400,
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
              }}
            >
              {labels.headlineDesktopLine1}
              <br />
              <em
                className="text-atelier-terre"
                style={{ fontStyle: 'var(--at-italic-style, italic)' }}
              >
                {labels.headlineDesktopItalic}
              </em>
              {labels.headlineDesktopAfter}
              <span className="text-atelier-cobalt">.</span>
            </h1>
            <p
              className="text-atelier-ink mt-[22px] max-w-[520px]"
              style={{
                fontFamily: 'var(--at-serif)',
                fontSize: 18,
                lineHeight: 1.5,
                opacity: 0.75,
              }}
            >
              {labels.leadDesktop}
            </p>

            <form
              action="/listings"
              role="search"
              className="mt-7 bg-atelier-cream border border-atelier-ink flex items-center gap-3 pl-5 pr-[6px] py-[6px] max-w-[580px]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <input
                type="search"
                name="search"
                placeholder={labels.searchPlaceholderDesktop}
                className="flex-1 bg-transparent outline-none text-atelier-ink placeholder:text-atelier-muted"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontStyle: 'var(--at-italic-style, italic)',
                  fontSize: 15,
                }}
                aria-label={labels.searchPlaceholderDesktop}
              />
              <button
                type="submit"
                className="bg-atelier-ink text-atelier-cream px-[22px] py-3"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {labels.searchAction}
              </button>
            </form>

            <div
              className="flex gap-7 mt-6 text-atelier-muted uppercase"
              style={{
                fontFamily: 'var(--at-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
              }}
            >
              <span>
                <b className="text-atelier-terre">{labels.statRating}</b> {labels.statReviews}
              </span>
              <span>
                <b className="text-atelier-cobalt">✓</b> {labels.statVerified}
              </span>
              <span>{labels.statResponse}</span>
            </div>
          </div>

          {/* Right collage with overlapping blocks */}
          <div className="relative h-[520px]">
            <div className="absolute top-0 left-10 w-[280px] h-[360px]">
              <Placeholder tone="terre" height={360} label={labels.imgPlumber} />
            </div>
            <div className="absolute top-[200px] right-0 w-[220px] h-[280px]">
              <Placeholder tone="ocre" height={280} label={labels.imgViolin} />
            </div>
            <div className="absolute top-20 left-0 w-[140px] h-[100px] bg-atelier-cobalt text-atelier-cream p-4">
              <div
                style={{
                  fontFamily: 'var(--at-mono)',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  opacity: 0.7,
                }}
              >
                {labels.todayBadge}
              </div>
              <div
                className="mt-[6px]"
                style={{
                  fontFamily: 'var(--at-serif)',
                  fontSize: 26,
                  fontStyle: 'var(--at-italic-style, italic)',
                }}
              >
                {labels.todayCount}
              </div>
              <div
                className="mt-[2px]"
                style={{
                  fontFamily: 'var(--at-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                }}
              >
                {labels.todayCaption}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
