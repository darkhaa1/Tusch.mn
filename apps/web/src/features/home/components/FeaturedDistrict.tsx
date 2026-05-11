/**
 * Atelier Home — FeaturedDistrict editorial card.
 * Mobile: cream band with khee divider + "Онцлох · №4" + headline + placeholder (atelier.jsx 275-282).
 * Desktop: half-width cream Block with eyebrow, 38px serif title, lead, 3 thumbs, italic CTA (atelier-desktop.jsx 254-269).
 *
 * On desktop, rendered as the left column of a 2-col section in page.tsx; on mobile, a standalone band.
 */
import { Placeholder, KheeBorder, LabelMono } from '@web/components/ui-v2';

const labels = {
  storyTopRight: '★ ТҮҮХ № 04',
  eyebrowDesktop: 'Онцлох',
  eyebrowMobile: 'Онцлох · №4',
  titleMobileA: 'Сүхбаатар дүүргийн ',
  titleMobileItalic: 'шилдэг',
  titleMobileC: ' мэргэжилтнүүд.',
  titleDesktopA: 'Сүхбаатар ',
  titleDesktopItalic: 'дүүргийн',
  titleDesktopC: 'шилдэг мастерууд.',
  lead:
    '«Цахилгаанчин, паркетчин, иогийн багш — гурван мэргэжилтэн нэг хорооллоос. 13 жилийн туршлага, хамтран ажилласан гэр бүл 200+.»',
  readMore: 'Үргэлжлүүлэн унших →',
  imgMobileLabel: 'Бат-Эрдэнэ',
};

export default function FeaturedDistrict() {
  return (
    <>
      {/* MOBILE */}
      <section className="md:hidden bg-atelier-cream px-5.5 pt-4.5 pb-5.5">
        <div className="mb-3.5">
          <KheeBorder color="var(--at-ink)" opacity={0.4} />
        </div>
        <LabelMono className="mb-2 block">{labels.eyebrowMobile}</LabelMono>
        <h2
          className="m-0 mb-3"
          style={{
            fontFamily: 'var(--at-serif)',
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
          }}
        >
          {labels.titleMobileA}
          <em style={{ fontStyle: 'var(--at-italic-style, italic)' }}>
            {labels.titleMobileItalic}
          </em>
          {labels.titleMobileC}
        </h2>
        <Placeholder tone="terre" height={110} label={labels.imgMobileLabel} />
      </section>

      {/* DESKTOP */}
      <div className="hidden md:block bg-atelier-cream p-10 relative">
        <span
          className="absolute top-5 right-6 text-atelier-terre uppercase"
          style={{
            fontFamily: 'var(--at-mono)',
            fontSize: 10,
            letterSpacing: '0.15em',
          }}
        >
          {labels.storyTopRight}
        </span>
        <LabelMono className="mb-4.5 block">{labels.eyebrowDesktop}</LabelMono>
        <h2
          className="m-0 text-atelier-ink"
          style={{
            fontFamily: 'var(--at-serif)',
            fontSize: 38,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          {labels.titleDesktopA}
          <em
            className="text-atelier-pourpre"
            style={{ fontStyle: 'var(--at-italic-style, italic)' }}
          >
            {labels.titleDesktopItalic}
          </em>
          <br />
          {labels.titleDesktopC}
        </h2>
        <p
          className="text-atelier-ink mt-4 mb-6 max-w-95"
          style={{
            fontFamily: 'var(--at-serif)',
            fontSize: 15,
            lineHeight: 1.55,
            opacity: 0.8,
          }}
        >
          {labels.lead}
        </p>
        <div className="flex gap-2.5">
          <Placeholder tone="rose" height={130} />
          <Placeholder tone="olive" height={130} />
          <Placeholder tone="terre" height={130} />
        </div>
        <div
          className="mt-6 text-atelier-ink"
          style={{
            fontFamily: 'var(--at-serif)',
            fontStyle: 'var(--at-italic-style, italic)',
            fontSize: 14,
          }}
        >
          {labels.readMore}
        </div>
      </div>
    </>
  );
}
